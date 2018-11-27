const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

// CSS后处理
module.exports = bus.on('编译CSS', function(scssIndexText){

	// btfFile仅用于出错信息提示
	return function(css, btfFile){
		
		// TODO autoprefix/友好的出错信息提示
		return Promise.resolve(css);
	};

}());

