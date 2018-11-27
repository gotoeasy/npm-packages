const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('编译LESS', function(lessIndexText){

	// btfFile仅用于出错信息提示
	return async function(less, btfFile){
		
		const env = bus.at('编译环境');
		let file = btfFile.substring(env.path.src_btf.length + 1);
		if ( lessIndexText === undefined ) {
			lessIndexText = File.exists(env.file.index_less) ? File.read(env.file.index_less) : '';
		}
		
		try{
			let rs = await csjs.lessToCss(lessIndexText + less, file, {filename: env.file.index_less});
			console.debug(MODULE, 'less compile ok');
			return rs.css;
		}catch(e){
			// TODO 友好的出错信息提示
			console.error(MODULE, 'less compile failed:', file);
			throw {message: e.message, filename: file, block: 'less', extract: e.extract};
		}
	};

}());

