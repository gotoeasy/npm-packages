const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('页面编译状态', function(){

	return function(htmlFile, state){
		state ? console.info(MODULE, 'build ok:', htmlFile) : console.info(MODULE, 'build ng:', htmlFile);;
	}

}());
