const csjs = require('@gotoeasy/csjs');
const Err = require('@gotoeasy/err');

const options = require('./lib/m020-options');
const TokenParser = require('./lib/m110-token');
const AstParser = require('./lib/m220-syntax-ast');
const AstEditor = require('./lib/m310-syntax-ast-editor');
const AstGen = require('./lib/m390-syntax-ast-gen');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';


// 模板编译为JavaScript函数
module.exports = function complie(doc, opts){

	// 自定义选项
	options(opts);

	let tokens, ast, js;

	try{
		let tokenParser = new TokenParser(doc);
		tokens = tokenParser.parse();
//console.info('-----------------------tokens-----------------------', tokens);
	}catch(e){
		throw Err.cat(MODULE + 'view token parse failed', e);
	}

	try{
		let astParser = new AstParser(tokens, doc);
		ast = astParser.parse();
	}catch(e){
		throw Err.cat(MODULE + 'view ast parse failed', e);
	}

	//	console.info('-----------------------1----------------------------------');
	//	console.info(JSON.stringify(ast, null, 4));

	try{
		let editor = new AstEditor();	// 合并连续的文本节点
		editor.edit(ast, doc);
	}catch(e){
		throw Err.cat(MODULE + 'view ast edit failed', e);
	}

	//	console.info('-----------------------2----------------------------------');
	//	console.info(JSON.stringify(ast, null, 4));

	try{
		let astGen = new AstGen(ast, doc);
		js = astGen.toJavaScript();
	}catch(e){
		//console.error(MODULE, e);
		throw Err.cat(MODULE + 'view gen js failed', e);
	}

	//console.info('----------------------------------------------------------');
	//console.info(csjs.formatJs(js));
	//console.info('----------------------------------------------------------');
	//console.info(csjs.formatJs(csjs.miniJs(js)));

	//return csjs.formatJs(js);
	//return csjs.miniJs(js);
	return js;

}

