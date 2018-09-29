
const options = require('./m020-options')();
const TokenReader = require('./m200-syntax-token-reader');
const syntaxCheck = require('./m210-syntax-check');

// ------------ 构建AST ------------
function AstParser(tokens){

	// ------------ 变量 ------------
	syntaxCheck(tokens); // 删除空白文本
	let reader = new TokenReader(tokens);
	let ast = [];

	// ------------ 接口方法 ------------
	// 解析
	this.parse = function() {
		return parseChildren();
	}

	// ------------ 内部方法 ------------
	// HTML子节点
	function parseChildren() {

		let ary = [], node;

		// 循环直到遇见标签闭合Token
		while ( !reader.eof() && reader.getCurrentToken().type != options.TypeTagClose ) {
			node = parseTag();
			node && ary.push(node);

			node = parseComment();
			node && ary.push(node);

			node = parseCodeBlock();
			node && ary.push(node);

			node = parseText();
			node && ary.push(node);

			node = parseExpression();
			node && ary.push(node);
		}

		return ary;
	}

	// HTML节点
	function parseTag() {
		if ( reader.eof() || (reader.getCurrentToken().type != options.TypeTagOpen && reader.getCurrentToken().type != options.TypeTagSelfClose) ) {
			return null;
		}



		let attrs, children, node = {tag: reader.getCurrentToken().text};

		let isClose = (reader.getCurrentToken().type == options.TypeTagSelfClose);
		reader.skip(1); // 跳过标签名

		// 收集属性
		attrs = parseAttr();

		if ( !isClose ) {
			children = parseChildren();
			if ( reader.getCurrentToken().type == options.TypeTagClose ) {
				if ( reader.getCurrentToken().text == node.tag ) {
					reader.skip(1); // 跳过闭合标签
				}else{
					throw new Error('close tag unmatch: ' + node.tag + ' / ' + reader.getCurrentToken().text); // 闭合标签名不匹配
				}
			}else{
				throw new Error('tag not close: ' + node.tag ); // 标签没有闭合
			}
		}

		attrs && (node.attrs = attrs);
		children && children.length && (node.children = children);
		return node;
	}

	// HTML节点属性
	function parseAttr() {
		if ( reader.eof() || reader.getCurrentToken().type != options.TypeAttributeName ) {
			return null;
		}

		let attr = {};
		while ( !reader.eof() && reader.getCurrentToken().type == options.TypeAttributeName ) {
			if ( reader.getNextToken().type == options.TypeEqual ) {
				let key = reader.getCurrentToken().text;
				reader.skip(2); // 跳过属性名、等号
				attr[key] = reader.readToken().text;
			}else{
				attr[reader.getCurrentToken().text] = true;
				reader.skip(1); // 跳过属性名
			}
		}

		return attr;
	}

	// HTML注释
	function parseComment() {
		if ( !reader.eof() && reader.getCurrentToken().type == options.TypeHtmlComment ) {
			reader.readToken(); // 跳过HTML注释
		}
		return null;
	}

	// 代码块 {% %}
	function parseCodeBlock() {
		if ( reader.eof() || reader.getCurrentToken().type != options.TypeCodeBlock ) {
			return null;
		}
		return {type: options.TypeCodeBlock, src: reader.readToken().text};
	}

	// 文本
	function parseText() {
		if ( reader.eof() || reader.getCurrentToken().type != options.TypeText ) {
			return null;
		}
		return {type: 'Text', src: reader.readToken().text};
	}

	// 表达式 {{ }}
	function parseExpression() {
		if ( reader.eof() || (reader.getCurrentToken().type != options.TypeUnescapeExpression && reader.getCurrentToken().type != options.TypeEscapeExpression) ) {
			return null;
		}

		if ( reader.getCurrentToken().type == options.TypeEscapeExpression ) {
			return {type: options.TypeEscapeExpression, src: reader.readToken().text};
		}else{
			return {type: options.TypeUnescapeExpression, src: reader.readToken().text};
		}
	}

}


module.exports = AstParser;

