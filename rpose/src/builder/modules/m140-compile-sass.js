const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('SCSS编译', function(scssIndexText){

	// btfFile仅用于出错信息提示
	return async function(scss, btfFile){
		
		if ( scssIndexText === undefined ) {
			const env = bus.at('编译环境');
			scssIndexText = File.exists(env.file.index_sass) ? File.read(env.file.index_sass) : '';
		}
		
		// TODO 友好的出错信息提示
		let rs = csjs.scssToCss(scssIndexText + scss, btfFile);
		console.info(MODULE, 'scss compile finish');
		return rs.css;
	};

}());

