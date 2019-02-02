const Err = require('@gotoeasy/err');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('编译SCSS', function(scssIndexText){

	// srcFile仅用于出错信息提示
	return async function(scss, srcFile){
		try{
			if ( !scss.trim() ) {
				return '';
			}
			
			if ( scssIndexText === undefined ) {
				const env = bus.at('编译环境');
				scssIndexText = File.exists(env.file.common_sass) ? File.read(env.file.common_sass) : '';
			}
			
            let file = srcFile.replace(/rpose$/i, 'scss');
            let includePaths = [File.path(srcFile)];
			return csjs.scssToCss(scssIndexText + scss, {file, includePaths});
		}catch(e){
			// TODO 友好的出错信息提示
			throw Err.cat(MODULE + 'compile scss failed', srcFile, e);
		}
	};

}());

