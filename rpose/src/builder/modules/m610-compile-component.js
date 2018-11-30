const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// 单纯的自身组件编译，不顾引用的组件是否有效
module.exports = bus.on('编译组件', function(fnTmpl){

	return async function(file, restart=false){
		try{
			if ( !fnTmpl ) {
				fnTmpl = await bus.at('编译模板JS');
			}
			if ( file.endsWith('.btf') ) {
				let btf = await bus.at('编译源文件', file, restart);
				let doc = btf.getDocument();
				doc.js = fnTmpl(doc);
				return btf;
			}else if ( file.indexOf(':') < 0 ) {
				let srcFile = bus.at('标签源文件', file);
				if ( !File.exists(srcFile) ) {
					throw Error.err(MODULE + 'component file not found (tag = ' + file + ')');
				}
				let btf = await bus.at('编译源文件', srcFile, restart);
				let doc = btf.getDocument();
				doc.js = fnTmpl(doc);
				return btf;
			}else{
				// TODO npm package
				throw new Error('TODO npm pkg')
			}

		}catch(e){
			// console.info(MODULE, '------------------------', file)
			throw Error.err(MODULE + 'compile component failed', file, e);
		}
	};

}());

