const File = require('@gotoeasy/file');
const Btf = require('@gotoeasy/btf');
const event = require('../event');


module.exports = event.on('环境', function(result={}){

	return (opts) => {

		if ( !opts ) {
			return result;
		}

		result.clean = opts.clean;
		result.path = opts.path.replace(/\\/g, '/');
		if ( result.path.substring(result.path.length-1) == '/' ) {
			result.path = result.path.substring(0, result.path.length-1);
		}
		result.urls = opts.urls;
		result.dirs = opts.dirs ? opts.dirs.map(dir => {
			dir = dir.replace(/\\/g, '/');
			return dir.substring(dir.length-1) == '/' ? dir.substring(0, dir.length-1) : dir;
		}) : null;
		result.debug = opts.debug;
		result.giturl = opts.giturl;
		result.dir = opts.dir;
		result.csv = opts.csv;
		result.work_path = result.path + '/work';

		result.prjs = {};
		result.urls && result.urls.forEach(url => {
			let project = url.substring(url.lastIndexOf('/')+1).replace('.git', '');
			result.prjs[project] = result.work_path + '/' + project;
		});
		result.dirs && result.dirs.forEach(dir => {
			let project = dir.substring(dir.lastIndexOf('/')+1);
			result.prjs[project] = dir;
		});

		getConfig(result);

		return result;
	};

}());


function getConfig(result){

	let configFile = result.path + '/count-line.config.btf'; // user config file
	if ( !File.exists(configFile) || !File.isFile(configFile) ) {
		let dirname = __dirname.replace(/\\/g, '/');
		configFile = dirname.substring(0, dirname.lastIndexOf('/')) + '/init-tmpl/count-line.config.btf'; // default config file
	}else{
		console.info('use user config file:', configFile);
	}

	let btf = new Btf(configFile);
	result.exts = (btf.getText('target-file') || '').replace(/ /g, '').trim().replace(/\*/g, '').replace(/\./g, '').split(',');
	result.exts.sort();
	console.debug('count target file:' , result.exts);

	result.extComment = {};
	result.exts.forEach(ext => {
		result.extComment[ext] = btf.getMap(ext);
	});

}