const bus = require('@gotoeasy/bus');
const PTask = require('@gotoeasy/p-task');
const File = require('@gotoeasy/file');
const error = require('@gotoeasy/error');
const compiler = require('../../compiler/compiler');
const acorn = require('acorn');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// TODO 重复编译CSS
module.exports = bus.on('编译源文件', function(){

	let ptask = new PTask((resolve, reject, isBroken) => async function(file){
		try{
			let btf = await bus.at('解析源文件', file);
			let doc = btf.getDocument();
			await parseBtfDocument(doc, file);
			resolve(btf);
		}catch(e){
			reject(error(MODULE + 'compile btf task failed', e));
		}
	});


	return async function (file, restart=false) {
		try{
			if ( file.endsWith('.btf') ) {
				bus.at('解析源文件', file, restart);
				return restart ? ptask.restart(file) : ptask.start(file);
				//await parseBtfDocument(btf.getDocument(), file);
				//return btf;
			}
			if ( file.indexOf(':') < 0 ) {
				let srcFile = bus.at('标签源文件', file);
				if ( !File.exists(srcFile) ) {
					throw Error.err(MODULE + 'component not found (tag = ' + file + ')');
				}
				bus.at('解析源文件', file, restart);
				return restart ? ptask.restart(srcFile) : ptask.start(srcFile);
				//await parseBtfDocument(btf.getDocument(), file);
				//return btf;
			}

			// TODO npm pkg
			throw new Error('TODO npm pkg');
		}catch(e){
			throw error(MODULE + 'compile btf failed', e);
		}
	};

}());


async function parseBtfDocument(doc, file){

	let theme = bus.at('样式风格');

	// CSS先于JS编译，JS编译会使用CSS类名修改前后的映射表
	let hasCss = !!doc.css
	try{
		// CSS预处理-LESS
		doc.less && (doc.css += '\n' + await bus.at('编译LESS', theme.themeLess + doc.less, file));
	}catch(e){
		throw error(MODULE + 'compile less failed', e);
	}

	try{
		// CSS预处理-SCSS
		doc.scss && (doc.css += '\n' + await bus.at('编译SCSS', theme.themeSass + doc.scss, file));
	}catch(e){
		throw error(MODULE + 'compile sass failed', e);
	}

	// CSS后处理
	if ( doc.css ) {
		let rs = await bus.at('编译组件CSS', (hasCss ? theme.themeCss : '') + doc.css, file);
		doc.css = rs.css;
		doc.mapping = rs.mapping; // 样式类名修改前后映射表
	}

	// TODO ..... 对应JS中的CSS类名修改

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

	return doc;
}

