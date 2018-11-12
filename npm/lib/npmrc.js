const File = require('gotoeasy-file');

module.exports = (function(){

	const npmrc = require('./homedir')() + '/.npmrc';

	return function (){
		let result = {};

		if ( File.existsFile(npmrc) ) {
			let lines = File.read(npmrc).split('\n').map(v=>v.trim());
			for ( let i=0; i<lines.length; i++ ) {
				let line = lines[i], k, v, idx = lines[i].indexOf('=');
				if ( idx > 0 ) {
					k = line.substring(0, idx).trim(); // key
					v = line.substring(idx+1).trim();  // value
					result[k] = v;
				}
			}
		}

		return result;
	}

})();
