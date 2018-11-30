const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');
const PTask = require('@gotoeasy/p-task');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('编译LESS', function(lessIndexText){

	let ptask = new PTask((resolve, reject, isBroken) => async function(less, btfFile){
		try{
			const env = bus.at('编译环境');
			let file = btfFile.substring(env.path.src_btf.length + 1);
			if ( lessIndexText === undefined ) {
				lessIndexText = File.exists(env.file.index_less) ? File.read(env.file.index_less) : '';
			}
		
			let rs = await csjs.lessToCss(lessIndexText + less, file, {filename: env.file.index_less});
			console.debug(MODULE, 'less compile ok');
			resolve( rs.css );
		}catch(e){
			// TODO 友好的出错信息提示
//			console.error(MODULE, 'less compile failed:', file);
//			reject( {message: e.message, filename: file, block: 'less', extract: e.extract} );
			reject( Error.err(MODULE + 'compile less failed', e.message, btfFile, e.extract, e) );
		}
	});


	// btfFile用于出错信息提示
	return function (less, btfFile, restart=false) {
		return restart ? ptask.restart(less, btfFile) : ptask.start(less, btfFile)
	};

}());

