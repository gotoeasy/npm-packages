const File = require('@gotoeasy/file');
const Err = require('@gotoeasy/err');
const options = require('./m020-options')();
const TemplateReader = require('./m100-reader');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// TODO 未转义字符引起的解析错误，友好提示

// \{ = '\u0000\u0001', \} = '\ufffe\uffff'
function escape(str){
	return str == null ? null : str.replace(/\\{/g, '\u0000\u0001').replace(/\\}/g, '\ufffe\uffff');
}
function unescape(str){
	return str == null ? null : str.replace(/\u0000\u0001/g, '{').replace(/\ufffe\uffff/g, '}');
}
function unescapeHtml(str){
	// 引号包围的属性值，做反向转义处理
	if ( /&/.test(str) ) {
		return str.replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
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
function TokenParser(doc){

	// ------------ 变量 ------------
	let file = escape(doc.file);
	let src = escape(doc.view);

	let reader = new TemplateReader(src);
	let tokens = [];
	tokens.src = src;

	// ------------ 接口方法 ------------
	// 解析
	this.parse = function() {
		while ( parseNode() || parseComment() || parseCdata() || parseCodeBlock() || parseExpression() || parseText() ) {}
		//while ( parseNode() || parseComment() || parseCdata() || parseCodeBlock() || parseExpression() || parseText() ) {}
		return tokens;
	}

	// ------------ 内部方法 ------------
	// HTML节点
	function parseNode() {
		let pos = reader.getPos();
		if ( reader.getCurrentChar() != '<' || reader.eof() || reader.getNextString(4) == '<!--' || reader.getNextString(9) == '<![CDATA['
			|| src.indexOf(options.CodeBlockStart, pos) == pos || src.indexOf(options.ExpressionStart, pos) == pos
			|| src.indexOf(options.ExpressionUnescapeStart, pos) == pos ) {
			return 0;
		}

		let token, tagNm = '', oPos;

		// -------- 标签闭合 --------
		if ( reader.getNextString(2) == '</' ) {
			let idx = src.indexOf('>', pos+3);
			if ( idx < 0 ) {
				return 0; // 当前不是节点闭合标签(【</xxx>】)
			}else{
				oPos = {};
				oPos.start = reader.getPos();
				reader.skip(2); // 跳过【</】
				while ( reader.getCurrentChar() != ">" && !reader.eof() ) {
					tagNm += reader.readChar();	// 只要不是【>】就算标签闭合名
				}
				reader.skip(1); // 跳过【>】
				oPos.end = reader.getPos();

				token = { type: options.TypeTagClose, text: tagNm.trim(), pos: oPos };	// Token: 闭合标签
				tokens.push(token);
				return 1;
			}
		}

		// -------- 标签开始 --------
		// 简单检查格式
		if ( reader.getCurrentChar() == '<' && src.indexOf('>', pos+2) < 0 ) {
			return 0; // 当前不是节点开始(起始【<】，但后面没有【>】)
		}

		if ( !/[a-z]/i.test(reader.getNextChar()) ) {
			return 0; // 当前不是节点开始(紧接【<】的不是字母)
		}

		// 节点名
		oPos = {};
		oPos.start = reader.getPos();
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

		let tokenTagNm = { type: '', text: unescape(tagNm).trim(), pos: oPos };	// Token: 标签 (类型待后续解析更新)
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
			oPos.end = reader.getPos();
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
			oPos.end = reader.getPos();

			return 1;

		}else{
			// error
			let text = File.read(file);
			let rs = /^\[view\][\s\S]*?\n|\n\[view\][\s\S]*?\n/i.exec(text);
			let offset = rs.index + rs[0].length + 1;
			let start = offset + oPos.start;
			let end = offset + reader.getPos() + 1;
			throw Err.cat('tag missing ">"', 'file=' + file, new Err( {text, start, end} )); // 标签结束符漏，如<tag 
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
		let oPos = {};
		oPos.start = reader.getPos();

		// 读取属性名
		let key = '', val = '';
		if ( reader.getCurrentChar() == '{' ) { // TODO 根据配置符号判断, 考虑误解析情况
			let stack = [];
			key += reader.readChar(); // 表达式开始
			while ( !reader.eof() ) {
				if ( reader.getCurrentChar() == '{' ) {
					if ( reader.getPrevChar() != '\\' ) {
						stack.push('{'); // 表达式中支持写{....}, 但字符串包含表达式符号将引起混乱误解析，编写时应避免
					}
				}
				if ( reader.getCurrentChar() == '}' ) {
					if ( reader.getPrevChar() != '\\' ) {
						if ( !stack.length ) {
							// 表达式结束
							key += reader.readChar();
							break; // 退出循环
						}
						stack.pop();
					}
				}
				key += reader.readChar();
			}
			if ( key == '' ) {
				return 0;
			}

		}else{
			while ( /[^\s=\/>]/.test(reader.getCurrentChar()) ) {
				key += reader.readChar();	// 只要不是【空白、等号、斜杠、大于号】就算属性名
			}
			if ( key == '' ) {
				return 0;
			}
		}

		oPos.end = reader.getPos();

		let token = { type: options.TypeAttributeName, text: unescape(key), pos: oPos };	// Token: 属性名
		tokens.push(token);

		// 跳过空白
		reader.skipBlank();
		oPos = {};
		oPos.start = reader.getPos();

		if ( reader.getCurrentChar() == '=' ) {
			oPos.end = reader.getPos()+1;
			token = { type: options.TypeEqual, text: '=', pos: oPos };	// Token: 属性等号
			tokens.push(token);

			// --------- 键值属性 ---------
			reader.skip(1);		// 跳过等号
			reader.skipBlank(); // 跳过等号右边空白
			oPos = {};
			oPos.start = reader.getPos();

			if ( reader.getCurrentChar() == '"' ) {
				// 值由双引号包围
				reader.skip(1);	// 跳过左双引号
				while ( !reader.eof() && reader.getCurrentChar() != '"' && reader.getCurrentChar() != '\r' && reader.getCurrentChar() != '\n' ) {
					val += reader.readChar();	// 只要不是【"】就算属性值
				}

				if ( reader.eof() || reader.getCurrentChar() != '"' ) {
					let text = File.read(file);
					let rs = /^\[view\][\s\S]*?\n|\n\[view\][\s\S]*?\n/i.exec(text);
					let offset = rs.index + rs[0].length + 1;
					let start = offset + tokens[tokens.length-2].pos.start;
					let end = offset + reader.getPos();
					throw Err.cat('invalid attributeValue', 'file=' + file, new Err( {text, start, end} )); // 属性值右边双引号没写
				}

				reader.skip(1);	// 跳过右双引号
				oPos.end = reader.getPos();

				token = { type: options.TypeAttributeValue, text: unescape(unescapeHtml(val)), pos: oPos };	// Token: 属性值(属性值中包含表达式组合的情况，在syntax-ast-gen中处理)
				tokens.push(token);
			}else if ( reader.getCurrentChar() == "'" ) {
				// 值由单引号包围
				reader.skip(1);	// 跳过左单引号
				while ( !reader.eof() && reader.getCurrentChar() != "'" && reader.getCurrentChar() != '\r' && reader.getCurrentChar() != '\n' ) {
					val += reader.readChar();	// 只要不是【'】就算属性值
				}

				if ( reader.eof() || reader.getCurrentChar() != "'" ) {
					let text = File.read(file);
					let rs = /^\[view\][\s\S]*?\n|\n\[view\][\s\S]*?\n/i.exec(text);
					let offset = rs.index + rs[0].length + 1;
					let start = offset + tokens[tokens.length-2].pos.start;
					let end = offset + reader.getPos();
					throw Err.cat('invalid attributeValue', 'file=' + file, new Err( {text, start, end} )); // 属性值右边单引号没写
				}

				reader.skip(1);	// 跳过右单引号
				oPos.end = reader.getPos();

				token = { type: options.TypeAttributeValue, text: unescape(unescapeHtml(val)), pos: oPos };	// Token: 属性值(属性值中包含表达式组合的情况，在syntax-ast-gen中处理)
				tokens.push(token);
			}else if ( reader.getCurrentChar() == "{" ) {
				// 值省略引号包围
				let stack = [];
				let posStart = reader.getPos();
				while ( !reader.eof() ) {
					if ( reader.getCurrentChar() == "{" ) {
						stack.push('{');
					}else if ( reader.getCurrentChar() == "}" ) {
						if ( !stack.length ) {
							break;
						}else if ( stack.length == 1 ){
							val += reader.readChar();	// 表达式结束
							break;
						}else{
							stack.pop();
						}
					}
					val += reader.readChar();	// 只要不是【'】就算属性值
				}
				if ( reader.eof() ) {
					let text = File.read(file);
					let rs = /^\[view\][\s\S]*?\n|\n\[view\][\s\S]*?\n/i.exec(text);
					let offset = rs.index + rs[0].length + 1;
					let start = offset + posStart;
					let end = offset + reader.getPos();
					throw Err.cat('invalid expression of AttributeValue: ' + val, 'file=' + file, new Err( {text, start, end} )); // 属性值表达式有误
				}
				oPos.end = reader.getPos();
				token = { type: options.TypeAttributeValue, text: unescape(val), pos: oPos };	// Token: 属性值
				tokens.push(token);
			}else{
				// 值应该是单纯数字
				while ( /[^\s\/>]/.test(reader.getCurrentChar()) ) {
					val += reader.readChar();	// 连续可见字符就放进去 //TODO 后续需正确性检查
				}

				if ( val.trim() == '' ) {
					let text = File.read(file);
					let rs = /^\[view\][\s\S]*?\n|\n\[view\][\s\S]*?\n/i.exec(text);
					let offset = rs.index + rs[0].length + 1;
					let start = offset + tokens[tokens.length-2].pos.start;
					let end = offset + reader.getPos() - val.length;
					throw Err.cat('missing attribute value', 'file=' + file, new Err( {text, start, end} )); // 属性值漏，如<tag aaa= />
				}
				oPos.end = reader.getPos();
				token = { type: options.TypeAttributeValue, text: unescape(val), pos: oPos };	// Token: 属性值
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
			let oPos = {};
			oPos.start = idxStart;
			oPos.end = idxEnd + 3;
			token = { type: options.TypeHtmlComment, text: unescape(src.substring(pos+4, idxEnd)), pos: oPos };	// Token: HTML注释
			reader.skip(idxEnd+3-pos); // 位置更新

			tokens.push(token);
			return 1;
		}

		return 0;
	}

	// CDATA
	function parseCdata() {
		let token, pos = reader.getPos();
		let idxStart = src.indexOf('<![CDATA[', pos), idxEnd = src.indexOf(']]>', pos+9);
		if ( idxStart == pos && idxEnd > pos ) {
			// 起始为【<![CDATA[】且后面有【]]>】
			let oPos = {};
			oPos.start = idxStart;
			oPos.end = idxEnd + 3;
			token = { type: options.TypeText, text: unescape(src.substring(pos+9, idxEnd)), pos: oPos };	// Token: CDATA, 暂按文本处理
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
			let oPos = {};
			oPos.start = idxStart;
			oPos.end = idxEnd + options.CodeBlockEnd.length;
			token = { type: options.TypeCodeBlock, text: unescape(src.substring(pos + options.CodeBlockStart.length, idxEnd)), pos: oPos }; // Token: 代码块
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
		let oPos = {};
		oPos.start = reader.getPos();

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
			oPos.end = reader.getPos();
			token = { type: options.TypeText, text: unescape(unescapeHtml(text)), pos: oPos };	// Token: 文本
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
		let oPos = {};
		oPos.start = reader.getPos();
		if ( options.ExpressionStart.length > options.ExpressionUnescapeStart.length ) {
			// 起始符较长者优先
			token = parseExpr(options.ExpressionStart, options.ExpressionEnd, options.TypeEscapeExpression) || parseExpr(options.ExpressionUnescapeStart, options.ExpressionUnescapeEnd, options.TypeUnescapeExpression);
		}else{
			token = parseExpr(options.ExpressionUnescapeStart, options.ExpressionUnescapeEnd, options.TypeUnescapeExpression) || parseExpr(options.ExpressionStart, options.ExpressionEnd, options.TypeEscapeExpression);
		}

		if ( token ) {
			oPos.end = reader.getPos();
			token.pos = oPos;
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

