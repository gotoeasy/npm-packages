const bus = require('@gotoeasy/bus');
const chokidar = require('chokidar');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('源文件监听', function(running){

	return function(){
		if ( running ) {
			return;
		}
		running = true;

		let env = bus.at('编译环境');
		let watcher = chokidar.watch(env.path.src_components, env.path.src_pages);

		watcher.on('add', file => {
			file = file.replace(/\\/g, '/');
			console.debug(MODULE, 'add file:', file);
			if ( file.endsWith('.btf') ) {
				bus.at('添加源文件', file);
			}
		}).on('change', file => {
			file = file.replace(/\\/g, '/');
			console.info(MODULE, 'change file:', file);
			if ( file.endsWith('.btf') ) {
				bus.at('修改源文件', file);
			}
		}).on('unlink', file => {
			file = file.replace(/\\/g, '/');
			console.debug(MODULE, 'delete file:', file);
			if ( file.endsWith('.btf') ) {
				bus.at('删除源文件', file);
			}
		});

		console.debug(MODULE, 'btf file watch is running ......');
	};

}());
