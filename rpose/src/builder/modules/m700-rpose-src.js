const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('rpose源码', function(src){

	let ary = __dirname.replace(/\\/g, '/').split('/');
	ary.pop() > ary.pop() > ary.pop();
	let root = ary.join('/');

	let srcDir = root + '/src/rpose';
	let fileDist = root + '/dist/rpose.js';

	return function(rebuild){
		if ( !src || rebuild ) {
			src = File.concat(srcDir);
			src = csjs.formatJs(src);
			File.write(fileDist, src);
			console.debug(MODULE, 'rpose build ok:', fileDist);
		}
		return src;
	};

}());
