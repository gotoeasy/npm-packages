const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('汇总页面关联JS代码', function(){

	return async function(btfFile, allrequires){
		try{
			// 组装代码
			let src = await pageJs(allrequires);

			// 默认美化，release时则压缩
			let env = bus.at('编译环境');
			src = env.release ? csjs.miniJs(src) : csjs.formatJs(src);

			return src;
		}catch(e){
			throw Error.err(MODULE + 'gen page js failed', btfFile, e)
		}
	};

}());


// 页面代码组装
async function pageJs(allrequires){

	let srcRpose = await bus.at('编译RPOSE');
	let srcStmt = getSrcRegisterComponents(allrequires);
	let srcComponents = await getSrcComponents(allrequires);

	let src = `
			${srcRpose}

			(function($$, escapeHtml){
				// 组件注册
				${srcStmt}

				${srcComponents}
			})(rpose.$$, rpose.escapeHtml);
		`;

	return src;
}

// 组件注册语句
function getSrcRegisterComponents(allrequires){
	try{
		let obj = {};
		for ( let i=0,tagpkg, key; tagpkg=allrequires[i++]; ) {
			key = "'" + tagpkg + "'";
			obj[key] = bus.at('组件类名', tagpkg);
		}

		return `rpose.registerComponents(${JSON.stringify(obj).replace(/"/g,'')});`;
	}catch(e){
		throw Error.err(MODULE + 'gen register stmt failed', allrequires, e);
	}
}

// 本页面关联的全部组件源码
async function getSrcComponents(allrequires){
	try{
		let ary = [];
		for ( let i=0,tagpkg,btf; tagpkg=allrequires[i++]; ) {
			btf = await bus.at('编译组件', tagpkg);
			ary.push( btf.getText('js') );
		}
		return ary.join('\n');
	}catch(e){
		throw Error.err(MODULE + 'get component src failed', allrequires, e);
	}
}
