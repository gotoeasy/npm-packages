const File = require('@gotoeasy/file');
const Btf = require('@gotoeasy/btf');
const bus = require('@gotoeasy/bus');
const util = require('@gotoeasy/util');

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
				throw new Error('opts error');
			}
			opts.workDir = (opts.workDir || '').replace(/\\/g, '/');
			let root = opts.workDir;
			(root.lastIndexOf('/') == root.length-1) && (root = root.substring(0, root.lastIndexOf('/')));
			if ( !File.existsDir(root) ) {
				throw new Error('work dir not exists: ' + root);
			}

			// 项目配置文件
			let conf = root + '/rpose.config.btf';
			let btf = File.exists(conf) ? new Btf(conf) : new Btf(defaultConf);
			let mapPath = btf.getMap('path');
			let mapCommon = btf.getMap('common');

			// 目录
			result.path.root = root;

			result.path.src = getConfPath(root, mapPathDefault, mapPath, 'src');
			result.path.src_btf = getConfPath(root, mapPathDefault, mapPath, 'src_btf');
			result.path.src_components = getConfPath(root, mapPathDefault, mapPath, 'src_components');
			result.path.src_pages = getConfPath(root, mapPathDefault, mapPath, 'src_pages');
			result.path.src_resources = getConfPath(root, mapPathDefault, mapPath, 'src_resources');

			result.path.build = getConfPath(root, mapPathDefault, mapPath, 'build');
			result.path.build_temp = getConfPath(root, mapPathDefault, mapPath, 'build_temp');
			result.path.build_dist = getConfPath(root, mapPathDefault, mapPath, 'build_dist');

			// reset.css、less、sass入口文件
			result.file.reset_css = root + '/' + (mapCommon.get('reset_css') || '').split('/').filter(v => !!v).join('/');
			result.file.index_less = root + '/' + (mapCommon.get('index_less') || '').split('/').filter(v => !!v).join('/');
			result.file.index_sass = root + '/' + (mapCommon.get('index_sass') || '').split('/').filter(v => !!v).join('/');
			!File.existsFile(result.file.reset_css) && (result.file.reset_css = null);
			!File.existsFile(result.file.index_less) && (result.file.index_less = null);
			!File.existsFile(result.file.index_sass) && (result.file.index_sass = null);

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
		return root + '/' + mapDefault.get(key).split('/').filter(v => !!v).join('/');
	}
	return root + '/' + map.get(key).split('/').filter(v => !!v).join('/');
}
