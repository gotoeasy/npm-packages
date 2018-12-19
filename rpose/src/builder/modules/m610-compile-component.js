const error = require('@gotoeasy/error');
const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// 单纯的自身组件编译，不顾引用的组件是否有效
module.exports = bus.on('编译组件', function(fnTmpl){

	return async function(file, restart=false){
		try{
			let env = bus.at('编译环境');
			if ( !fnTmpl ) {
				fnTmpl = await bus.at('编译模板JS');
			}
			if ( file.endsWith('.btf') ) {
				let btf = await bus.at('编译源文件', file, restart);
				let doc = btf.getDocument();
				doc.js = fnTmpl(doc);
let to = env.path.build_temp + '/' + bus.at('默认标签名', file) + '.js';		// 假定组件都编译到%build_temp%目录
await File.writePromise(to, await require('@gotoeasy/csjs').formatJs(doc.js));
				return btf;
			}else if ( file.indexOf(':') < 0 ) {
				let srcFile = bus.at('标签源文件', file);
				if ( !File.exists(srcFile) ) {
					throw error(new Error('component file not found (tag = ' + file + ')'));
				}
				let btf = await bus.at('编译源文件', srcFile, restart);
				let doc = btf.getDocument();
				doc.js = fnTmpl(doc);
let to = env.path.build_temp + '/' + bus.at('默认标签名', srcFile) + '.js';		// 假定组件都编译到%build_temp%目录
await File.writePromise(to, await require('@gotoeasy/csjs').formatJs(doc.js));
				return btf;
			}else{
				// TODO npm package
				throw error(new Error('TODO npm pkg'));
			}

		}catch(e){
			// console.info(MODULE, '------------------------', file)
			throw error(MODULE + 'compile component failed', file, e);
		}
	};

}());

