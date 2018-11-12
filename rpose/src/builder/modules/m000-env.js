const bus = require('@gotoeasy/bus');
const util = require('@gotoeasy/util');


module.exports = bus.on('编译环境', function(result = {path:{}}){

	return function(opts){
		if ( util.isNotEmpty(opts) ) {
			let root = opts.workDir.replace(/\\/g, '/');
			(root.lastIndexOf('/') == root.length-1) && (root = root.substring(0, root.lastIndexOf('/')));

			result.path.cwd = root;
			result.path.root = root;
			result.path.project = root;

			result.path.src = result.path.project + '/src';
			result.path.src_components = result.path.src + '/components';
			result.path.src_pages = result.path.src + '/pages';
			result.path.src_less = result.path.src + '/less';
			result.path.src_resources = result.path.src + '/resources';
			result.path.src_resources_css = result.path.src_resources + '/css';
			result.path.src_resources_js = result.path.src_resources + '/js';

			result.path.build = root + '/build';
			result.path.build_temp = root + '/build/temp';
			result.path.build_temp_components = root + '/build/temp/components';
			result.path.build_temp_pages = root + '/build/temp/pages';
			result.path.build_temp_csjs = root + '/build/temp/csjs';
			result.path.build_dist = root + '/build/dist';
			result.path.build_dist_components = root + '/build/dist/components';
			result.path.build_dist_pages = root + '/build/dist/pages';
			result.path.build_dist_csjs = root + '/build/dist/csjs';
			result.path.build_libs = root + '/build/libs';

			result.path.settings = root + '/settings';
			result.path.settings_less = root + '/settings/less';

			Object.assign(result, opts);

			console.debug('----------- m000-env ----------- (env)');
			console.debug(result);
		}
		return result;
	};

}());

