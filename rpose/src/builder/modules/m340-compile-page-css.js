const error = require('@gotoeasy/error');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('编译页面CSS', function(){

	// btfFile定位编译前的css文件位置
	return async function(css, btfFile){
		try{
			let env = bus.at('编译环境');
//console.info(MODULE,'-----------compile page css----------', bus.at('默认标签名', btfFile))

			// TODO 友好的出错信息提示
			let from = env.path.build_temp + '/' + bus.at('默认标签名', btfFile) + '.css';	// 页面由组件拼装，组件都在%build_temp%目录
			let to = env.path.build_dist + btfFile.substring(env.path.src_btf.length, btfFile.length-4) + '.css';
			let assetsPath = File.relative(to, env.path.build_dist + '/images');			// 图片统一复制到%build_dist%/images，按生成的css文件存放目录决定url相对路径
			
			let rs;
			let opt = {from, to, assetsPath,
				normalize: true,
				removeComments: true
			};

			if ( env.release ) {
				rs = await csjs.miniCss(css, opt);
			}else{
				rs = await csjs.formatCss(css, opt);
			}
			return rs.css;
		}catch(e){
			throw error(MODULE + 'compile page css failed', btfFile, e);
		}
	};

}());
