const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const hash = require('@gotoeasy/hash');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('哈希样式类名', function(){
    
    let regIgnore = /^rpose-|^hidden$|^active$|^hljs/i; // 不哈希处理的名称 // TODO，转为配置实现？

    return function renameCssClassName(srcFile, clsName){

        // 非release模式时不哈希
        const env = bus.at('编译环境');
//        if ( !env.release ) return clsName;
        
        // 特殊名称不哈希
        if ( regIgnore.test(clsName) ) {
            return clsName;
        }

        // 哈希
        let aryText = [];
        aryText.push(bus.at('标签全名', srcFile));
        aryText.push(clsName);
        return '_' + hash(aryText.join('\n'));
    }

}());

