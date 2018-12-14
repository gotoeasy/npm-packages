const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');
const File = require('@gotoeasy/file');
const browserify = require('browserify');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('汇总页面关联JS代码', function(){

	return async function(btfFile, allrequires){
		try{
			// 组装代码
			let src = await pageJs(allrequires, btfFile);

			// 默认美化，release时则压缩
			let env = bus.at('编译环境');
			src = (env.release ? csjs.miniJs(src) : csjs.formatJs(src));

			return src;
		}catch(e){
			throw Error.err(MODULE + 'gen page js failed', btfFile, e)
		}
	};

}());


// 页面代码组装
async function pageJs(allrequires, btfFile){

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

	let env  = bus.at('编译环境');
	let tag  = bus.at('默认标签名', btfFile);
	if ( env.release ) {
		try{
			console.time(MODULE + 'babel      ' + tag)
			src = csjs.babel(src);
			console.timeEnd(MODULE + 'babel      ' + tag)
		}catch(e){
			throw Error.err(MODULE + 'babel transform page js failed', e)
		}

		try{
			console.time(MODULE + 'browserify ' + tag)
			src = await csjs.browserify(src);
			console.timeEnd(MODULE + 'browserify ' + tag)
		}catch(e){
			throw Error.err(MODULE + 'browserify transform page js failed', e)
		}
	}

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
