const bus = require('@gotoeasy/bus');
const PTask = require('@gotoeasy/p-task');
const File = require('@gotoeasy/file');
const compiler = require('../../compiler/compiler');
const acorn = require('acorn');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('编译源文件', function(){

	let ptask = new PTask((resolve, reject, isBroken) => async function(btf, file){
		try{
			let doc = btf.getDocuments()[0];
			await parseBtfDocument(doc, file);
			resolve(btf);
		}catch(e){
			reject(Error.err(MODULE + 'compile btf failed', e));
		}
	});


	return async function (file, restart=false) {
		try{
			if ( file.endsWith('.btf') ) {
				let btf = await bus.at('解析源文件', file, restart);
				return restart ? ptask.restart(btf, file) : ptask.start(btf, file);
			}
			if ( file.indexOf(':') < 0 ) {
				let srcFile = bus.at('标签源文件', file);
				if ( !File.exists(srcFile) ) {
					throw Error.err(MODULE + 'component not found (tag = ' + file + ')');
				}
				let btf = await bus.at('解析源文件', srcFile, restart);
				return restart ? ptask.restart(btf, srcFile) : ptask.start(btf, srcFile);
			}

			// TODO npm pkg
			throw new Error('TODO npm pkg');
		}catch(e){
			throw Error.err(MODULE + 'compile btf failed', e);
		}
	};

}());


async function parseBtfDocument(doc, file){

	// 注意块名为小写，编辑后的数据对象将作为模板数据对象直接传给代码模板
	doc.$fnTemplate	= await compiler(doc);						// 模板函数源码，html为模板，state、options、methods等用于检查模板变量
	doc.requires = doc.requires || [];								// 编译后设定直接依赖的组件标签全名数组

	// statekeys的$SLOT可在编译期判断得知，所以程序可以省略不写
	if ( doc.$fnTemplate.indexOf('.$SLOT ') > 0 ) {
		if ( doc.statekeys == null ) {
			doc.statekeys = ["$SLOT"];
		}else{
			!doc.statekeys.includes('$SLOT') && doc.statekeys.push('$SLOT');
		}
	}

	// CSS预处理-LESS
	doc.less && (doc.css += '\n' + await bus.at('编译LESS', doc.less, file));

	// CSS预处理-SCSS
	doc.scss && (doc.css += '\n' + await bus.at('编译SCSS', doc.scss, file));

	// CSS后处理-autoprefix
	doc.css && (doc.css = await bus.at('编译CSS', doc.css, file));

	return doc;
}

