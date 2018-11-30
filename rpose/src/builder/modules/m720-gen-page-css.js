const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');
const File = require('@gotoeasy/file');
const PTask = require('@gotoeasy/p-task');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('汇总页面关联CSS代码', function(){

	return async function(btfFile, allrequires){

		try{
			// 组装代码返回
			let src = await pageCss(allrequires);

			// 默认美化，release时则压缩
			let env = bus.at('编译环境');
			src = env.release ? csjs.miniCss(src) : csjs.formatCss( csjs.miniCss(src) );

			return src;
		}catch(e){
			throw Error.err(MODULE + 'gen page css failed', btfFile, allrequires, e)
		}

	};
}());


async function pageCss(allrequires){
	let env = bus.at('编译环境');
	let cssCommon = '';
	if ( File.exists(env.file.common_css) ) {
		cssCommon = await bus.at('异步读文件', env.file.common_css);
	}

	let ary = [cssCommon];
	for ( let i=0,tagpkgOrFile,btf; tagpkgOrFile=allrequires[i++]; ) {
		btf = await bus.at('编译组件', tagpkgOrFile);
		ary.push( btf.getDocument().css );
	}
	return ary.join('\n');
}
