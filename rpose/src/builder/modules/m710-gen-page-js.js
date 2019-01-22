const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');
const File = require('@gotoeasy/file');
const browserify = require('browserify');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('汇总页面关联JS代码', function(){

	return async function(file, allrequires){

        let env = bus.at('编译环境');
        let hashs = bus.at('计算页面哈希', file, allrequires);
        let cache = bus.at('缓存', env.release ? 'js-min' : 'js-format');
        let oRs = cache.get(file);
        if ( oRs ) {
            if ( oRs.hashs === hashs ) {        // TODO 考虑配置变化
                return oRs.js;
            }
        }

        oRs = {hashs};
        cache.put(file, oRs);                   // 更新缓存

		try{
			// 组装代码
			let src = await pageJs(allrequires, file);

			// 默认美化，release时则压缩
			oRs.js = env.release ? csjs.miniJs(src) : csjs.formatJs(src);
            return oRs.js;
		}catch(e){
			throw Err.cat(MODULE + 'gen page js failed', file, e)
		}
	};

}());


// 页面代码组装
async function pageJs(allrequires, file){

	let srcRpose = await bus.at('编译RPOSE');
	let srcStmt = getSrcRegisterComponents(allrequires);
	let srcComponents = await getSrcComponents(allrequires);
	let requireAxios = ''; // srcComponents.indexOf('axios') > 0 ? 'let axios = require("axios");' : ''; // 简易的按需引入axios

    let	oParse = bus.at('解析源文件', file);
	let tag  = bus.at('默认标签名', file);
	let mount  = oParse.mount;


	let src = `
			${requireAxios}
			${srcRpose}

			(function($$, escapeHtml){
				// 组件注册
				${srcStmt}

				${srcComponents}

                // 组件挂载
                rpose.mount( rpose.newComponentProxy('${tag}').render(), '${mount}' );
			})(rpose.$$, rpose.escapeHtml);
		`;

	let env  = bus.at('编译环境');
	if ( env.release ) {
		try{
			console.time(MODULE + 'babel      ' + tag)
			src = csjs.babel(src);
			console.timeEnd(MODULE + 'babel      ' + tag)
		}catch(e){
			throw Err.cat(MODULE + 'babel transform page js failed', e)
		}

		try{
			console.time(MODULE + 'browserify ' + tag)
			src = await csjs.browserify(src, null);
//			src = await csjs.browserify(src, null, 'axios');  // browserify(code, basedir, ...externals)
			console.timeEnd(MODULE + 'browserify ' + tag)
		}catch(e){
			throw Err.cat(MODULE + 'browserify transform page js failed', e)
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
		throw Err.cat(MODULE + 'gen register stmt failed', allrequires, e);
	}
}

// 本页面关联的全部组件源码
async function getSrcComponents(allrequires){
	try{
		let ary = [];
		for ( let i=0,tagpkg,oComponent; tagpkg=allrequires[i++]; ) {
			oComponent = await bus.at('编译组件', tagpkg);
			ary.push( oComponent.js );
		}
		return ary.join('\n');
	}catch(e){
		throw Err.cat(MODULE + 'get component src failed', allrequires, e);
	}
}
