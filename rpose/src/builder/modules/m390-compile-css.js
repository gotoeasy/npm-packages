const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// CSS后处理
// 精简、加前缀、url转换
module.exports = bus.on('编译CSS', function(){

	// file仅用于出错信息提示
	return function(css, file){
		try{
			let env = bus.at('编译环境');

			// TODO 友好的出错信息提示
			css = csjs.miniCss(css);

			let rname = file.substring(env.path.src_btf.length, file.length-4) + '.css';	// 源文件相对路径 %src_btf%/pages/acbd.btf => /pages/acbd.css
			let cssFileTo = env.path.build_dist + rname;									// 目标路径 %build_dist%/pages/acbd.css
			let srcPath = require('path').dirname(file);									// 源代码样式路径同源文件，即编写代码时仅考虑自身url相对路径 %src_btf%/pages/acbd.btf => %src_btf%/pages
			let assetsPath = getAssetsPath(rname);											// 图片统一复制到%build_dist%/images，按生成的css文件存放目录决定url相对路径
			css = csjs.cssUrl(srcPath, css, cssFileTo, getAssetsPath(rname));				// 转换url

			return csjs.autoprefixer( css );
		}catch(e){
			throw Error.err(MODULE + 'compile css failed', file, e);
		}
	};

}());

function getAssetsPath(file){
	let name = file;
	if ( name.startsWith('/') ) {
		name = name.substring(1);
	}

	let ary = name.split('/');
	if ( ary.length == 1 ) {
		return './images';
	}
	return '../'.repeat(ary.length-1) + 'images';
}