const File = require('gotoeasy-file');
const gitpullorclone = require('git-pull-or-clone');
const event = require('./event');

module.exports = function(opts){

	require('./loadModules')();
	
	let env = event.at('环境', opts);

	if ( env.clean ) {
		console.info('clean work directory:', env.work_path);
		File.remove(env.work_path);
	}

	env.giturl && env.urls.forEach((url,i) => {
		console.log('start download ......', url);
		let name = getProjectName(url);
		let path = env.work_path + '/' + name;

		gitpullorclone(url, path, e => {
			if ( e ) {
				console.log('download NG --------------', url, '--------------');
			}else{
				console.log('download OK ......', url);
				event.at('统计项目行数', path, name);
			}
		})
	});

	env.dir && env.dirs.forEach(dir => {
		let path = dir.substring(dir.length-1) == '/' ? dir.substring(0, dir.length-1) : dir;
		let name = dir.substring(path.lastIndexOf('/')+1);
		event.at('统计项目行数', dir, name);
	});

	event.at('统计结果汇总输出');

	(env.giturl && !env.urls.length) && console.log('please input url to download and count');
	(env.dir && !env.dirs.length) && console.log('please input directory to count');

}

function getProjectName(url){
	return url.substring(url.lastIndexOf('/')+1).replace('.git', '');
}

