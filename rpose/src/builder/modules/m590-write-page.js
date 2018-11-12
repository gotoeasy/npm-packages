const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('页面代码输出', function(rposeJs, resetCss, iStart){

	return function(pageTag, pages){
		let env = bus.at('编译环境');
		if ( !rposeJs ) {
			rposeJs = bus.at('rpose源码');
			resetCss = File.read(env.path.src_resources_css + '/reset.css');
			iStart = env.path.src_pages.length; // src_pages目录长度，用于截取子目录
		}

		let manager = bus.at('编译管理');
		const aryTagReqs = manager.tagRequireAll;

		let srcFile = getFileName(manager, pageTag);
		let subName = srcFile.substring(iStart + 1, srcFile.length-4).toLowerCase()
		let name = env.path.build_dist + '/' + subName; // 固定目录,保留子目录
		let fileJs = name + '.js', fileCss = name + '.css', fileHtml = name + '.html', jsSrc = [], cssSrc = [], src;

		let componentsJs = bus.at('页面依赖组件汇总JS', pageTag); // File.read(env.path.build_temp_csjs + '/components.js'); // TODO
		jsSrc.push(rposeJs);
		jsSrc.push(componentsJs);

		// 要es2015则转换
		src = env.es5 ? csjs.es2015(jsSrc.join('\n')) : jsSrc.join('\n');
		// 默认美化js，release时则压缩
		src = env.release ? csjs.miniJs(src) : csjs.formatJs(src);
		File.write(fileJs, src);

		let componentsCss = bus.at('页面依赖组件汇总CSS', pageTag); // File.read(env.path.build_temp_csjs + '/components.css'); // TODO
		cssSrc.push(resetCss);
		cssSrc.push(componentsCss);
		cssSrc.push(pages[pageTag].css);
		let assetsPath = getAssetsPath(subName);
		csjs.cssUrl(env.path.src_resources_css, cssSrc.join('\n'), fileCss, assetsPath, async function(css){
			// 默认美化css，release时则压缩
			File.write(fileCss, env.release ? csjs.miniCss(css) : csjs.formatCss(css) );
		});

		console.info(MODULE, '     write:', fileJs);
		console.info(MODULE, '     write:', fileCss);
		bus.at('页面HTML代码输出', pageTag, fileHtml);

	};

}());

// 根据目录结构补足相对路径"../"
function getAssetsPath(subName){
	let len = subName.split('/').length - 1;

	let rs = '';
	for ( let i=0; i<len; i++ ) {
		rs += '../';
	}

	return rs + 'images'
}


function getFileName(manager, tag){
	for ( let file in manager.pageTags ) {
		if ( manager.pageTags[file] == tag ) {
			return file;
		}
	}
	throw new Error('file of tag [' + tag + '] not found');
}