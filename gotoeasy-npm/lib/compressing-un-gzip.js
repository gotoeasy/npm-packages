
const compressing = require('compressing');


module.exports = function unGzip(gzip, path){

	return new Promise(function(resolve, reject){
		compressing.gzip.uncompress(gzip, path).then(resolve(path));
	});

};

