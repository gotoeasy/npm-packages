const Btf = require('@gotoeasy/btf');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const chokidar = require('chokidar');

module.exports = function (opts){

	(async function(){
console.time('build');

		require('./loadModules')();
		let env = bus.at('编译环境', opts);

		try{
			bus.at('clean');
			await bus.at('编译全部页面');
		}catch(e){
			console.error(e);
			throw e;
		}

console.timeEnd('build');




	let ready, watcher = chokidar.watch(env.path.src_btf);
	watcher.on('add', file => {
		if ( ready ) {
			file = file.replace(/\\/g, '/');
			console.info('add:', file);
			if ( file.endsWith('.btf') ) {
				bus.at('源文件清单', file, true);
			}
		}
	}).on('change', file => {
		if ( ready ) {
			file = file.replace(/\\/g, '/');
			console.info('change:', file);
			if ( file.endsWith('.btf') ) {
				bus.at('重新编译被更新源文件', file);
			}
		}
	}).on('unlink', file => {
		if ( ready ) {
			file = file.replace(/\\/g, '/');
			console.info('delete:', file);
			if ( file.endsWith('.btf') ) {
				bus.at('源文件清单', file, false);
			}
		}
	}).on('ready', () => {
		ready = true;
	});




	})();

}


