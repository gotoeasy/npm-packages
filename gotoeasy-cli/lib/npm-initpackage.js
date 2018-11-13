const File = require('@gotoeasy/file');

function initpackage(opts){

	let filePackageBtf = opts.workDir + '/package.btf';
	let fileTemplate = __dirname + '/template-package.btf';

	File.write(filePackageBtf, File.read(fileTemplate) );
	console.info('file:', filePackageBtf);
}


module.exports = initpackage;
