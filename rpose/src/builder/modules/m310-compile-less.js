const Err = require('@gotoeasy/err');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');
const PTask = require('@gotoeasy/p-task');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('编译LESS', function(lessIndexText){

	let node_modules = [...require('find-node-modules')({ cwd: process.cwd(), relative: false }), ...require('find-node-modules')({ cwd: __dirname, relative: false })];
    let paths = [];
    node_modules.forEach(p => paths.push(File.resolve(p, '..')));


	let ptask = new PTask((resolve, reject, isBroken) => async function(less, srcFile){
		try{
			const env = bus.at('编译环境');
			let file = srcFile.substring(env.path.src.length + 1);
			if ( lessIndexText === undefined ) {
				lessIndexText = File.exists(env.file.common_less) ? File.read(env.file.common_less) : '';
			}

            let includePaths = [File.path(srcFile), ...paths];  // 加入node-modules的上级目录作为查找路径，便于在代码中直接使用node-modules相对路径
			let css = await csjs.lessToCss( less, {paths: includePaths});
			console.debug(MODULE, 'less compile ok');
			resolve( css );
		}catch(e){
			// TODO 友好的出错信息提示
			reject( Err.cat(MODULE + 'compile less failed', e.message, srcFile, e.extract, e) );
		}
	});


	// srcFile用于出错信息提示
	return function (less, srcFile, restart=false) {
		return restart ? ptask.restart(less, srcFile) : ptask.start(less, srcFile)
	};

}());

