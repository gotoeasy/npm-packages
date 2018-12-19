const options = require('./m020-options')();
const TokenReader = require('./m200-syntax-token-reader');

// 删除空白文本
module.exports = function syntaxCheck(tokens){

	let isPreTag; // pre标签内的空白不做删除处理
	let token, reader = new TokenReader(tokens);
	while ( !reader.eof() ) {
		token = reader.readToken();
		if ( isPreTag ) {
			if ( token.type == options.TypeTagClose && token.text.toLowerCase() == 'pre' ) {
				isPreTag = false;
			}
		}else{
			if ( token.type == options.TypeTagOpen && token.text.toLowerCase() == 'pre' ) {
				isPreTag = true;
			}
		}

		if ( !isPreTag && token.type == options.TypeText && !token.text.trim().length ) {
			let nextToken = reader.getNextToken();
			if ( !nextToken.type || (nextToken.type != options.TypeEscapeExpression && nextToken.type != options.TypeUnescapeExpression) ) {
				token.del = true; // 后续不是表达式，基本就是可以删除的的空白文本了， // TODO 误删否？
			}
		}else if ( token.type == options.TypeHtmlComment ) {
			token.del = true; // 删除HTML注释节点
		}
	}

	for ( let i=tokens.length-1; i>=0; i--) {
		if ( tokens[i].del ) {
			tokens.splice(i, 1);
		}
	}

	return tokens;
}

