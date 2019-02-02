const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// 单纯的自身组件编译，不顾引用的组件是否有效
module.exports = bus.on('编译组件', function(){

	return async function(fileOrTag){

        let file = fileOrTag.endsWith('.rpose') ? fileOrTag : bus.at('标签源文件', fileOrTag);
        
        let cache = bus.at('缓存', 'compile-component');      // 指定名的缓存对象
        let oResult = cache.get(file);
        let oSrc = bus.at('源文件内容', file);
        if ( oResult && oResult.hashcode === oSrc.hashcode ) {     // TODO 考虑配置因素
            return oResult;
        }

        oResult = {hashcode: oSrc.hashcode};
        cache.put(file, oResult);

        try{
			let env = bus.at('编译环境');
            let fnTmpl = bus.at('编译模板JS');

			if ( fileOrTag.endsWith('.rpose') || fileOrTag.indexOf(':') < 0 ) {
				if ( !File.exists(file) ) {
					throw new Err('component not found (tag = ' + fileOrTag + ')');
				}

                let oCompile = await bus.at('编译源文件', file);
                oCompile.imagepath = bus.at('页面图片相对路径', file);
				let js = fnTmpl(oCompile);
                js = replaceCssClassName(oCompile.mapping, js);

                oResult.js = js;
                oResult.css = oCompile.css;
                oResult.requires = oCompile.requires;

let to = env.path.build_temp + '/' + bus.at('默认标签名', file) + '.js';		// 假定组件都编译到%build_temp%目录
!env.release && await File.writePromise(to, await require('@gotoeasy/csjs').formatJs(js));

				return oResult;

			}else{
				// TODO npm package
				throw new Err('TODO npm pkg');
			}

		}catch(e){
			// console.info(MODULE, '------------------------', file)
			throw Err.cat(MODULE + 'compile component failed', file, e);
		}
	};

}());

function replaceCssClassName(oMapping, js){
    // TODO 通过AST修改
    if ( oMapping ) {
        for ( let k in oMapping ) {
            js = js.replace(new RegExp(`\\$\\$\\(("|')\\.?${k}("|')\\)`, 'ig'), `$$$('.${oMapping[k]}')`);              // 类名哈希化， $$('.my-class') -> $$('.xxxxxxxx')
            js = js.replace(new RegExp(`\\.addClass\\(("|')${k}("|')\\)`, 'ig'), `.addClass('${oMapping[k]}')`);        // 类名哈希化， .addClass('my-class') -> .addClass('xxxxxxxx')
            js = js.replace(new RegExp(`\\.removeClass\\(("|')${k}("|')\\)`, 'ig'), `.removeClass('${oMapping[k]}')`);  // 类名哈希化， .removeClass('my-class') -> .removeClass('xxxxxxxx')
        }
    }

    return js;
}