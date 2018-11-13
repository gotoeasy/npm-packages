const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('reset样式源码', function(result){

	return function(){
		if ( result === undefined ) {
			let env = bus.at('编译环境');
			result = File.exists(env.file.reset_css) ? File.read(env.file.reset_css) : '';
			console.debug(MODULE, 'reset.css read ok:', env.file.reset_css);
		}
		return result;
	};

}());
