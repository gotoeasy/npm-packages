const Err = require('@gotoeasy/err');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// 组件CSS单独编译主要为了解决url更新和资源复制目的
module.exports = bus.on('编译组件CSS', function(){

	return async function(css, srcFile){
		
		// ------------ 修改样式类名 ------------
		let rename = name => bus.at('哈希样式类名', srcFile, name);
		// -------------------------------------

		try{
			let env = bus.at('编译环境');
//console.info(MODULE,'-----------compile component css----------', bus.at('默认标签名', srcFile))
			// 组件源文件位置作为来源
			let from = srcFile.substring(0, srcFile.length-6) + '.css';
			let to = env.path.build_temp + '/' + bus.at('组件目标文件名', srcFile) + '.css';		// 假定组件都编译到%build_temp%目录
			let assetsPath = File.relative(to, env.path.build_dist + '/images');			// 图片统一复制到%build_dist%/images，按生成的css文件存放目录决定url相对路径

			let opt = {from, to, assetsPath, rename};
			//let rs = await csjs.cssUrl(css, opt);
			let rs = await csjs.miniCss(css, opt);

			!env.release && await File.writePromise(to, await csjs.formatCss(rs.css));
			return rs;
		}catch(e){
			throw Err.cat(MODULE + 'compile component css failed', srcFile, e);
		}
	};

}());

