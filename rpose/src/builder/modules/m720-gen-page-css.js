const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const csjs = require('@gotoeasy/csjs');
const File = require('@gotoeasy/file');
const PTask = require('@gotoeasy/p-task');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('汇总页面关联CSS代码', function(){

	return async function(file, allrequires){

        let env = bus.at('编译环境');
        let hashs = bus.at('计算页面哈希', file, allrequires);
        let cache = bus.at('缓存', env.release ? 'css-min' : 'css-format');
        let oResult = cache.get(file);
        if ( oResult ) {
            if ( oResult.hashs === hashs ) {        // TODO 考虑配置变化
                return oResult.css;
            }
        }
        
        oResult = {hashs};
        cache.put(file, oResult);                   // 更新缓存

		try{
			// 组装代码返回
			let src = await pageCss(allrequires);
			let css = await bus.at('编译页面CSS', src, file);

            oResult.css = css;
            return css;
		}catch(e){
			throw Err.cat(MODULE + 'gen page css failed', file, allrequires, e)
		}

	};
}());


async function pageCss(allrequires){

    let ary = [];
	ary.push('@import-normalize;');		// postcss-normalize插件专用语句，根据browserslist从normalize.css选择使用必要内容
	for ( let i=0,tagpkgOrFile,oComp; tagpkgOrFile=allrequires[i++]; ) {
		oComp = await bus.at('编译组件', tagpkgOrFile);
		ary.push( oComp.css );
	}
	return ary.join('\n');
}
