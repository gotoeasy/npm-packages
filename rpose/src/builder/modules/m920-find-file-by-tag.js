const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('按标签名找文件', function (fileSet){

	return function(tag, pkg=''){

		if ( !fileSet ) {
			// 初期检索源文件清单
			let env = bus.at('编译环境');
			let files = File.files(env.path.src_btf, 'components/**.btf', 'pages/**.btf');
			fileSet = new Set(...files);
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

