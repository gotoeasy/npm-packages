const File = require('@gotoeasy/file');

module.exports = function(opts){

	let txt = File.read(__dirname + '/init-tmpl/count-line.config.btf');
	let file = opts.path + '/count-line.config.btf';
	File.write(file, txt);
	console.log('config file:', file);

}
