const Btf = require('@gotoeasy/btf');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const Err = require('@gotoeasy/err');
const hash = require('@gotoeasy/hash');
const chokidar = require('chokidar');
const bs = require("browser-sync").create('sync');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = function (opts){

	(async function(){

		// 初始化
console.time('load');
		require('./loadModules')();
console.timeEnd('load');


console.time('build');
		let env = bus.at('编译环境', opts);
		bus.at('clean');

		// 全部编译
		let buildAllOk = await buildAllPages();
console.timeEnd('build');


		// 监视文件变化
		let ready, watcher = chokidar.watch(env.path.src);
		watcher.on('add', async file => {
			if ( ready && (file = file.replace(/\\/g, '/')) && file.endsWith('.rpose') ) {
				!buildAllOk && (buildAllOk = await buildAllPages());
                bus.at('源文件添加', file);
                bus.at('源文件读取并缓存', file)
                console.info(MODULE, 'add ......', file);
                bus.at('重新编译被更新源文件', file).catch(e=>console.error(Err.cat(e).toString()));
			}
		}).on('change', async file => {
			if ( ready && (file = file.replace(/\\/g, '/')) && file.endsWith('.rpose') ) {
				!buildAllOk && (buildAllOk = await buildAllPages());
                if ( bus.at('源文件读取并缓存', file) ) {
                    console.info(MODULE, 'change ......', file);
                    bus.at('重新编译被更新源文件', file).catch(e=>console.error(Err.cat(e).toString()));
                }
			}
		}).on('unlink', async file => {
			if ( ready && (file = file.replace(/\\/g, '/')) && file.endsWith('.rpose') ) {
                !buildAllOk && (buildAllOk = await buildAllPages());
                bus.at('源文件删除', file);
                console.info(MODULE, 'remove ......', file);
                try{
                    await bus.at('源文件删除时再编译', file);
                }catch(e){
                    console.error(Err.cat(e).toString());
                }
            }
		}).on('ready', () => {
			ready = true;
		});

		
		// 创建服务器同步刷新浏览器
		bs.init({
			server: env.path.build_dist
		});
		bs.watch('**/*.html').on('change', bs.reload);


	})();

}

async function buildAllPages(){
	// 全部编译
	try{
		await bus.at('编译全部页面', true);
		return true;
	}catch(e){
		console.error(Err.cat(e).toString());
	}
}
