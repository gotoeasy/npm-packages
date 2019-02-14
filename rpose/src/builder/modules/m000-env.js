const File = require('@gotoeasy/file');
const Btf = require('@gotoeasy/btf');
const bus = require('@gotoeasy/bus');
const util = require('@gotoeasy/util');
const Err = require('@gotoeasy/err');
const npm = require('@gotoeasy/npm');
const path = require('path');

// 从根目录的rpose.config.btf读取路径文件配置
// 读不到则使用默认配置
module.exports = bus.on('编译环境', function(result){

	// 默认配置文件
	let ary = __dirname.replace(/\\/g, '/').split('/');
	ary.pop() > ary.pop();
	let defaultConf = ary.join('/') + '/project-template/rpose.config.btf'; // 默认配置
	let btfDefault = new Btf(defaultConf);
	let mapPathDefault = btfDefault.getMap('path');

	return function(opts){
		if ( !result ) {
			result = {path:{}, file:{}};

			if ( !opts || !opts.workDir ) {
				throw new Err('opts error');
			}
			opts.workDir = (opts.workDir || '').replace(/\\/g, '/');
			let root = opts.workDir;
			(root.lastIndexOf('/') == root.length-1) && (root = root.substring(0, root.lastIndexOf('/')));
			if ( !File.existsDir(root) ) {
				throw new Err('work dir not exists: ' + root);
			}

			// 项目配置文件
			let conf = root + '/rpose.config.btf';
			let btf = File.exists(conf) ? new Btf(conf) : new Btf(defaultConf);
			let mapPath = btf.getMap('path');
            mapPath.forEach((v,k) => mapPath.set(k, v.split('//')[0].trim()));

            let mapImport = btf.getMap('import');
            let imports = {};
            mapImport.forEach( (v,k) => imports[k] = v.split('//')[0].trim() );
            result.imports = imports;

			// 目录
			result.path.root = root;

			result.path.src = getConfPath(root, mapPathDefault, mapPath, 'src');

            result.path.src_buildin = path.resolve(__dirname, '../../buildin').replace(/\\/g, '/');

			result.path.build = getConfPath(root, mapPathDefault, mapPath, 'build');
			result.path.build_temp = result.path.build + '/temp';
			result.path.build_dist = result.path.build + '/dist';

			result.theme = ((btf.getText('theme') == null || !btf.getText('theme').trim()) ? '@gotoeasy/theme' : btf.getText('theme').trim());
			result.prerender = ((btf.getText('prerender') == null || !btf.getText('prerender').trim()) ? '@gotoeasy/pre-render' : btf.getText('prerender').trim());

            // 自动检查安装依赖包
            autoInstallLocalModules(result.theme, result.prerender);

			// 继续浅复制配置
			Object.assign(result, opts);

			console.debug('----------- m000-env ----------- (env)');
			console.debug(result);

			// 清除默认配置引用对象
			defaultConf = null;
			btfDefault = null;
			mapPathDefault = null;
		}

		return result;
	};

}());

function getConfPath(root, mapDefault, map, key){
	// TODO 检查配置目录的合法性
	if ( !map.get(key) || map.get(key) == '/' ) {
		console.debug('use default path setting:', key);
        let defaultSetting = mapDefault.get(key) == null ? '' : mapDefault.get(key);
		return root + '/' + defaultSetting.split('/').filter(v => !!v).join('/');
	}
	return root + '/' + map.get(key).split('/').filter(v => !!v).join('/');
}

// TODO 提高性能
function autoInstallLocalModules(...names){
    let ignores = ['@gotoeasy/theme', '@gotoeasy/pre-render'];

	let node_modules = [ ...require('find-node-modules')({ cwd: __dirname, relative: false }), ...require('find-node-modules')({ cwd: process.cwd(), relative: false })];

    for ( let i=0,name; name=names[i++]; ) {
        if ( ignores.includes(name) ) continue;

        let isInstalled = false;
        for ( let j=0,dir; dir=node_modules[j++]; ) {
            if ( File.isDirectoryExists( File.resolve(dir, name) ) ) {
                isInstalled = true;
                continue;
            }
        }
        !isInstalled && npm.install(name);
    }

}