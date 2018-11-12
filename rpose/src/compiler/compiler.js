const csjs = require('@gotoeasy/csjs');

const options = require('./lib/m020-options');
const TokenParser = require('./lib/m110-token');
const AstParser = require('./lib/m220-syntax-ast');
const AstEditor = require('./lib/m310-syntax-ast-editor');
const AstGen = require('./lib/m390-syntax-ast-gen');


// 模板编译为JavaScript函数
function complie(doc, opts){

	// 自定义选项
	options(opts);

	let tokenParser = new TokenParser(doc.html);
	let tokens = tokenParser.parse();
	//console.info(tokens);

	let astParser = new AstParser(tokens, doc);
	let ast = astParser.parse();

//	console.info('-----------------------1----------------------------------');
//	console.info(JSON.stringify(ast, null, 4));

	let editor = new AstEditor();	// 合并连续的文本节点
	editor.edit(ast);
//	console.info('-----------------------2----------------------------------');
//	console.info(JSON.stringify(ast, null, 4));

	let astGen = new AstGen(ast, doc);
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