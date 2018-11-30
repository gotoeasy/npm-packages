const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('源文件清单', function (fileSet){

	// add=true添加，false则删除
	return function(files, add=true, reload=false){

		if ( reload || !fileSet ) {
			// 初期检索源文件清单
			let env = bus.at('编译环境');
			let files = File.files(env.path.src_btf, '**.btf');
			fileSet = new Set(files);
//console.info(MODULE, 'init file list', fileSet);
			return [...fileSet];
		}


		// 取源文件清单
		if ( files === undefined ) {
			return [...fileSet];
		}

		// 添加或删除文件数组
		if ( Array.isArray(files) || files instanceof Array ) {
			files.forEach( file => add ? fileSet.add(file) : fileSet.delete(file) );
			return [...fileSet];
		}

		// 添加或删除单个文件
		if ( files ) {
			add ? fileSet.add(files) : fileSet.delete(files);
		}
		return [...fileSet];
	}

}());

