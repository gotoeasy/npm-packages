const Btf = require('@gotoeasy/btf');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const chokidar = require('chokidar');
const bs = require("browser-sync").create('sync');
const hash = require('string-hash');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = function (opts){

	(async function(){
console.time('build');

		// 初始化
console.time('load');
		require('./loadModules')();
console.timeEnd('load');
		let env = bus.at('编译环境', opts);
		bus.at('clean');

		// 全部编译
		let buildAllOk = await buildAllPages();

console.timeEnd('build');

		// 监视文件变化
		let ready, watcher = chokidar.watch(env.path.src_btf);
		watcher.on('add', async file => {
			if ( ready && (file = file.replace(/\\/g, '/')) && file.endsWith('.btf') ) {
				!buildAllOk && (buildAllOk = await buildAllPages());
				notifyAdd(file);
			}
		}).on('change', async file => {
			if ( ready && (file = file.replace(/\\/g, '/')) && file.endsWith('.btf') ) {
				!buildAllOk && (buildAllOk = await buildAllPages());
				notifyChange(file);
			}
		}).on('unlink', file => {
			ready && (file = file.replace(/\\/g, '/')) && file.endsWith('.btf') && notifyRemove(file);
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
		console.error(MODULE, e.stack);
	}
}


// 哪里的问题导致一次保存两次文件变更。。。
// 暂用文件内容哈希判断是否真的变了
const mapFileHash = new Map();
function notifyAdd(file){
	console.info(MODULE, 'add ......', file);

	bus.at('异步读文件', file, true)
		.then(txt => {
			let hashVal = hash(txt);
			if ( mapFileHash.get(file) != hashVal ) {
				mapFileHash.set(file, hashVal);
				bus.at('重新编译被更新源文件', file).catch(e=>console.error(MODULE, e));
			}
		})
		.catch(e=>console.error(MODULE, e));
}
function notifyChange(file){

	bus.at('异步读文件', file, true)
		.then(txt => {
			let hashVal = hash(txt);
			if ( mapFileHash.get(file) != hashVal ) {
console.info(MODULE, 'change ......', file);
				mapFileHash.set(file, hashVal);
				bus.at('重新编译被更新源文件', file).catch(e=>console.error(MODULE, e));
			}
		})
		.catch(e=>console.error(MODULE, e));
}
function notifyRemove(file){

	(async ()=>{
		console.info(MODULE, 'remove ......', file);
		try{
			await bus.at('源文件删除时再编译', file);
		}catch(e){
			console.error(MODULE, e.stack);
		}
	})();
}
