
const compressing = require('compressing');


module.exports = function gzip(path, gzipFile){

	return new Promise(function(resolve, reject){
		compressing.gzip.compressFile(path, gzipFile).then(resolve(gzipFile));
	});

};

