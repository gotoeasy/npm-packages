
const options = require('./m020-options')();
const TemplateReader = require('./m100-reader');

// TODO 未转义字符引起的解析错误，友好提示

// \{ = '\u0000\u0001', \} = '\ufffe\uffff'
function escape(str){
	return str == null ? null : str.replace(/\\{/g, '\u0000\u0001').replace(/\\}/g, '\ufffe\uffff');
}
function unescape(str){
	return str == null ? null : str.replace(/\u0000\u0001/g, '{').replace(/\ufffe\uffff/g, '}');
}
function unescapeHtml(str){
	if ( /&/.test(str) ) {
		return str.replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '&').replace(/&amp;/g, '&');
	}
	return str;
}

// ------------ 分词 ------------
/*
let html=`
<!-- 模板例子 -->
<div>
{% for (let i=0; i<ary.length; i++) { %}
	<my-tag type="{ary[i].type}">{ ary[i].text }</my-tag>
	<input type="text">
{% } %}
</div>
`;

let tokenParser = new TokenParser(html);
let tokens = tokenParser.parse();
console.info(tokens);
*/
function TokenParser(src){

	// ------------ 变量 ------------
	src = escape(src);
	let reader = new TemplateReader(src);
	let tokens = [];

	// ------------ 接口方法 ------------
	// 解析
	this.parse = function() {
		while ( parseNode() || parseComment() || parseCodeBlock() || parseExpression() || parseText() ) {}
		return tokens;
	}

	// ------------ 内部方法 ------------
	// HTML节点
	function parseNode() {
		let pos = reader.getPos();
		if ( reader.getCurrentChar() != '<' || reader.eof() || reader.getNextString(4) == '<!--'
			|| src.indexOf(options.CodeBlockStart, pos) == pos || src.indexOf(options.ExpressionStart, pos) == pos
			|| src.indexOf(options.ExpressionUnescapeStart, pos) == pos ) {
			return 0;
		}

		let token, tagNm = '';

		// -------- 标签闭合 --------
		if ( reader.getNextString(2) == '</' ) {
			let idx = src.indexOf('>', pos+3);
			if ( idx < 0 ) {
				return 0; // 当前不是节点闭合标签(【</xxx>】)
			}else{
				reader.skip(2); // 跳过【</】
				while ( reader.getCurrentChar() != ">" ) {
					tagNm += reader.readChar();	// 只要不是【'】就算属性值
				}
				reader.skip(1); // 跳过【>】

				token = {type: options.TypeTagClose, text: unescape(tagNm).trim()};	// Token: 闭合标签
				tokens.push(token);
				return 1;
			}
		}

		// -------- 标签开始 --------
		// 简单检查格式
		if ( reader.getCurrentChar() != '<' && src.indexOf('>', pos+2) < 0 ) {
			return 0; // 当前不是节点开始(起始【<】，但后面没有【>】)
		}

		if ( !/[a-z]/i.test(reader.getNextChar()) ) {
			return 0; // 当前不是节点开始(紧接【<】的不是字母)
		}

		// 节点名
		reader.skip(1);	// 跳过起始【<】
		while ( /[^\s\/>]/.test(reader.getCurrentChar())  ) {
			tagNm += reader.readChar(); // 非空白都按名称处理
		}
//		if ( /[-_a-z0-9]/i.test(tagNm)  ) { // 标签名只能是半角数字字母和减号下划线组成，且字母开头
//			// *********************** 【特例】 非合法标签名，按文本看待 ***********************
//			token = {type: options.TypeText, text: '<' + tagNm};	// Token: 文本
//			tokens.push(token);
//			return 1;
//		}

		let tokenTagNm = {type: '', text: unescape(tagNm).trim()};	// Token: 标签 (类型待后续解析更新)
		tokens.push(tokenTagNm);

		// 全部属性
		while ( parseAttr() ) {}

		// 跳过空白
		reader.skipBlank();

		// 检查标签结束符
		if ( reader.getNextString(2) == '/>' ) {
			// 无内容的自闭合标签，如<one-tag/>
			tokenTagNm.type = options.TypeTagSelfClose; // 更新 Token: 标签
			reader.skip(2);	// 跳过【/>】
			return 1;
		}

		if ( reader.getCurrentChar() == '>' ) {
			// 默认可以自闭合的标签（如<br>）
			if ( options.AutoCloseTags.includes(tagNm.toLowerCase()) ) {
				tokenTagNm.type = options.TypeTagSelfClose; // 更新 Token: 标签
			}else{
				tokenTagNm.type = options.TypeTagOpen; // 更新 Token: 标签
			}

			reader.skip(1);	// 跳过【>】
			return 1;

		}else{
			// error
			throw new Error('E001(pos=' + (reader.getPos() - val.length) + ')'); // 标签结束符漏，如<tag 
		}

		// 子节点解析通过递归解决
	}

	// HTML节点属性
	function parseAttr() {
		if ( reader.eof() ) {
			return 0;
		}

		// 跳过空白
		reader.skipBlank();

		// 读取属性名
		let key = '', val = '';
		while ( /[^\s=\/>]/.test(reader.getCurrentChar()) ) {
			key += reader.readChar();	// 只要不是【空白、等号、斜杠、大于号】就算属性名
		}
		if ( key == '' ) {
			return 0;
		}

		let token = { type: options.TypeAttributeName, text: unescape(key) };	// Token: 属性名
		tokens.push(token);

		// 跳过空白
		reader.skipBlank();

		if ( reader.getCurrentChar() == '=' ) {
			token = { type: options.TypeEqual, text: '=' };	// Token: 属性等号
			tokens.push(token);

			// --------- 键值属性 ---------
			reader.skip(1);		// 跳过等号
			reader.skipBlank(); // 跳过等号右边空白

			if ( reader.getCurrentChar() == '"' ) {
				// 值由双引号包围
				reader.skip(1);	// 跳过左双引号
				while ( reader.getCurrentChar() != '"' ) {
					val += reader.readChar();	// 只要不是【"】就算属性值
				}
				reader.skip(1);	// 跳过右双引号

				token = { type: options.TypeAttributeValue, text: unescape(unescapeHtml(val)) };	// Token: 属性值
				tokens.push(token);
			}else if ( reader.getCurrentChar() == "'" ) {
				// 值由单引号包围
				reader.skip(1);	// 跳过左单引号
				while ( reader.getCurrentChar() != "'" ) {
					val += reader.readChar();	// 只要不是【'】就算属性值
				}
				reader.skip(1);	// 跳过右单引号

				token = { type: options.TypeAttributeValue, text: unescape(unescapeHtml(val)) };	// Token: 属性值
				tokens.push(token);
			}else{
				// 值应该是单纯数字
				while ( /[^\s\/>]/.test(reader.getCurrentChar()) ) {
					val += reader.readChar();	// 连续可见字符就放进去 //TODO 后续需正确性检查
				}

				if ( val.trim() == '' ) {
					throw new Error('E002(pos=' + (reader.getPos() - val.length) + ')'); // 属性值漏，如<tag aaa= />
				}
				token = { type: options.TypeAttributeValue, text: unescape(unescapeHtml(val)) };	// Token: 属性值
				tokens.push(token);
			}

		}else{
			// --------- boolean型无值属性 ---------
		}

		return 1;
	}

	// HTML注释
	function parseComment() {
		let token, pos = reader.getPos();
		let idxStart = src.indexOf('<!--', pos), idxEnd = src.indexOf('-->', pos+4);
		if ( idxStart == pos && idxEnd > pos ) {
			// 起始为【<!--】且后面有【-->】
			token = { type: options.TypeHtmlComment, text: unescape(src.substring(pos+4, idxEnd)) };	// Token: HTML注释
			reader.skip(idxEnd+3-pos); // 位置更新

			tokens.push(token);
			return 1;
		}

		return 0;
	}

	// 代码块 {% %}
	function parseCodeBlock() {
		let token, pos = reader.getPos();
		let idxStart = src.indexOf(options.CodeBlockStart, pos), idxEnd = src.indexOf(options.CodeBlockEnd, pos + options.CodeBlockStart.length);
		if ( idxStart == pos && idxEnd > 0 ) {
			// 起始为【{%】且后面有【%}】
			token = { type: options.TypeCodeBlock, text: unescape(src.substring(pos + options.CodeBlockStart.length, idxEnd)) }; // Token: 代码块
			reader.skip(idxEnd + options.CodeBlockEnd.length - pos); // 位置更新

			tokens.push(token);
			return 1;
		}
		
		return 0;
	}

	// 文本
	function parseText() {
		if ( reader.eof() ) {
			return 0;
		}

		let token, text = '', pos;
		while ( !reader.eof() ) {
			text += reader.readChar();
			pos = reader.getPos();

			if ( reader.getCurrentChar() == '<' || src.indexOf(options.CodeBlockStart, pos) == pos
				|| src.indexOf(options.ExpressionStart, pos) == pos || src.indexOf(options.ExpressionUnescapeStart, pos) == pos ) {
				break; // 见起始符则停
			}
		}

		if ( text ) {
			token = {type: options.TypeText, text: unescape(unescapeHtml(text))};	// Token: 文本
			tokens.push(token);
			return 1;
		}

		return 0;
	}

	// 表达式 { } 或 {= }
	function parseExpression() {
		if ( reader.eof() ) {
			return 0;
		}

		let token;
		if ( options.ExpressionStart.length > options.ExpressionUnescapeStart.length ) {
			// 起始符较长者优先
			token = parseExpr(options.ExpressionStart, options.ExpressionEnd, options.TypeEscapeExpression) || parseExpr(options.ExpressionUnescapeStart, options.ExpressionUnescapeEnd, options.TypeUnescapeExpression);
		}else{
			token = parseExpr(options.ExpressionUnescapeStart, options.ExpressionUnescapeEnd, options.TypeUnescapeExpression) || parseExpr(options.ExpressionStart, options.ExpressionEnd, options.TypeEscapeExpression);
		}

		if ( token ) {
			tokens.push(token);
			return 1;
		}
		return 0;
	}

	function parseExpr(sStart, sEnd, type) {
		let pos = reader.getPos();
		let idxStart = src.indexOf(sStart, pos), idxEnd = src.indexOf(sEnd, pos + sStart.length);
		if ( idxStart == pos && idxEnd > 0 ) {
//			let rs = { type: type, text: src.substring(pos + sStart.length, idxEnd) }; // Token: 表达式(删除两边的表达式符号)
			let rs = { type: type, text: unescape(src.substring(pos, idxEnd + sEnd.length)) }; // Token: 表达式(保留原样)
			reader.skip(idxEnd + sEnd.length - pos); // 位置更新
			return rs;
		}
		return null;
	}

}


module.exports = TokenParser;

