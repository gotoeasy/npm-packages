const csjs = require('gotoeasy-csjs');

const options = require('./lib/m020-options');
const TokenParser = require('./lib/m110-token');
const AstParser = require('./lib/m220-syntax-ast');
const AstGen = require('./lib/m390-syntax-ast-gen');


// 模板编译为JavaScript函数
function complie(htmlTemplate, opts){

	// 自定义选项
	options(opts);

	let tokenParser = new TokenParser(htmlTemplate);
	let tokens = tokenParser.parse();
	//console.info(tokens);

	let astParser = new AstParser(tokens);
	let ast = astParser.parse();

	//console.info('----------------------------------------------------------');
	//console.info(JSON.stringify(ast, null, 4));

	let astGen = new AstGen(ast);
	let js = astGen.toJavaScript();
	//console.info('----------------------------------------------------------');
	//console.info(csjs.formatJs(js));
	//console.info('----------------------------------------------------------');
	//console.info(csjs.formatJs(csjs.miniJs(js)));

	//return csjs.formatJs(js);
	//return csjs.miniJs(js);
	return js;
}

module.exports = complie;