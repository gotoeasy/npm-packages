const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const hash = require('@gotoeasy/hash');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('哈希样式类名', function(){
    
    let regIgnore = /^rpose-|^hide$|^show$|^active$|^hljs/i; // 语法高亮的.hljs/.hljs-xxx默认支持，不做修改 // TODO，转为配置实现？

    return function renameCssClassName(srcFile, clsName){
//            return clsName;
        if ( regIgnore.test(clsName) ) {
            return clsName;
        }

        let aryText = [];
        aryText.push(bus.at('默认标签名', srcFile));
        aryText.push(clsName);
        return '_' + hash(aryText.join('\n'));
    }

}());

