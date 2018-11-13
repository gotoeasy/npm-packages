const File = require('@gotoeasy/file');
const compressing = require('compressing');


module.exports = function tgz(path, tgz){

	File.remove(tgz);

	return new Promise(function(resolve, reject){
		compressing.tgz.compressDir(path, tgz).then(resolve(true));
	});

};

