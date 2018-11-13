
const compressing = require('compressing');


module.exports = function unTgz(tgz, path){

	return new Promise(function(resolve, reject){
		compressing.tgz.uncompress(tgz, path).then(resolve(true));
	});

};

