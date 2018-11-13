const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('LESS编译', function(lessIndexText){

	// btfFile仅用于出错信息提示
	return async function(less, btfFile){
		
		const env = bus.at('编译环境');
		if ( lessIndexText === undefined ) {
			lessIndexText = File.exists(env.file.index_less) ? File.read(env.file.index_less) : '';
		}
		
		// TODO 友好的出错信息提示
		let rs = await csjs.lessToCss(lessIndexText + less, btfFile, {filename: env.file.index_less});
		console.debug(MODULE, 'less compile finish');
		return rs.css;
	};

}());

