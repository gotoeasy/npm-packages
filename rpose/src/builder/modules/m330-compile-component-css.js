const Err = require('@gotoeasy/err');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// 组件CSS单独编译主要为了解决url更新和资源复制目的
module.exports = bus.on('编译组件CSS', function(){

	return async function(css, btfFile){
		
		// ------------ 修改样式类名 ------------
		let rename = name => renameCssClassName(btfFile, name);
		// -------------------------------------

		try{
			let env = bus.at('编译环境');
//console.info(MODULE,'-----------compile component css----------', bus.at('默认标签名', btfFile))
			// 组件源文件位置作为来源
			let from = btfFile.substring(0, btfFile.length-4) + '.css';
			let to = env.path.build_temp + '/' + bus.at('默认标签名', btfFile) + '.css';		// 假定组件都编译到%build_temp%目录
			let assetsPath = File.relative(to, env.path.build_dist + '/images');			// 图片统一复制到%build_dist%/images，按生成的css文件存放目录决定url相对路径

			let opt = {from, to, assetsPath, rename};
			//let rs = await csjs.cssUrl(css, opt);
			let rs = await csjs.miniCss(css, opt);

			!env.release && await File.writePromise(to, await csjs.formatCss(rs.css));
			return rs;
		}catch(e){
			throw Err.cat(MODULE + 'compile component css failed', btfFile, e);
		}
	};

}());

function renameCssClassName(btfFile, cls){
	if ( cls == 'hljs' || cls.startsWith('hljs-') ) {
		return cls; // 语法高亮的.hljs/.hljs-xxx默认支持，不做修改 // TODO，转为配置实现？
	}
	let aryHash = [];
	aryHash.push(bus.at('默认标签名', btfFile));
	aryHash.push(cls);
	return hash(aryHash.join('\n'));
}

function hash(str){
	let rs = 5381, i = str.length;
	while ( i ) {
		rs = (rs * 33) ^ str.charCodeAt(--i);
	}
	
	return '_' + (rs >>> 0).toString(36);
}
