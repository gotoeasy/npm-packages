const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');
const PTask = require('@gotoeasy/p-task');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('汇总页面关联CSS代码', function(){

	return async function(btfFile, allrequires){

		// 组装代码返回
		let src;
		try{
			src = await pageCss(allrequires);
		}catch(e){
			console.error(MODULE, 'gen page css failed', e);
			throw e;
		}

		// 默认美化，release时则压缩
		let env = bus.at('编译环境');
		src = env.release ? csjs.miniCss(src) : csjs.formatCss( csjs.miniCss(src) );

		return src;
	};
}());


async function pageCss(allrequires){
	// TODO common css
	let ary = [];
	for ( let i=0,tagpkgOrFile,rs; tagpkgOrFile=allrequires[i++]; ) {
		rs = await bus.at('编译组件', tagpkgOrFile);
		ary.push( rs.css );
	}
	return ary.join('\n');
}
