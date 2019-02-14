const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const Btf = require('@gotoeasy/btf');
const File = require('@gotoeasy/file');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('项目组件引用配置', function(rs={}){
    
    return function (pkg){

        // 模块包项目
        if ( pkg ) {
            let oPkg = bus.at('模块组件信息', pkg);
            let name = oPkg.name;

            let cachename = 'imports_' + oPkg.pkg.replace(/\//g, '#');
            let cache = bus.at('缓存', cachename);      // 指定名(模块时含包名和版本)的缓存对象
            if ( !cache.get('import') ) {
                let imports = {};
                if ( File.existsFile(oPkg.config) ) {
                    let btf = new Btf(oPkg.config);
                    let mapImport = btf.getMap('import');
                    mapImport.forEach( (v,k) => imports[k] = v.split('//')[0].trim() );
                }
                cache.put('import', imports);
            }

            return cache.get('import');
        }

        // 当前项目
		return bus.at('编译环境').imports;
    }

}());


module.exports = bus.on('自动安装引用组件', function(){
    
    // tag: 标签名（组件标签）
    // imp： 标签组件引用设定
    return function (tag, imp){

        // 硬编码优先于配置
        if ( imp ) {
            let tagname, pkgtag;  // tagname为引用的标签名
            if ( imp.indexOf(':') > 0 ) {
                pkgtag = imp;
                tagname = imp.split(':')[1];
            }else{
                pkgtag = imp + ':' + tag;
                tagname = tag;
            }

            bus.at('自动安装', pkgtag);

            // 若该标签是配置引用实现，则递归继续找
            let imports = bus.at('项目组件引用配置', pkgtag);
            if ( imports[tagname] ) {
                let impconf = imports[tagname];
                impconf.indexOf(':') < 0 && (impconf = impconf + ':' + tagname);
                return bus.at('自动安装引用组件', null, impconf);
            }

            // 源码实现时，检查源码文件是否存在
            let file = bus.at('标签源文件', pkgtag);
            if ( !file ) {
                throw new Err('component not found (' + pkgtag + ')');  // TODO 友好的提示信息
            }
            return pkgtag;
        }

        // 检查当前项目配置
        let imports = bus.at('项目组件引用配置');
        if ( imports[tag] ) {
            let impconf = imports[tag];
            impconf.indexOf(':') < 0 && (impconf = impconf + ':' + tag);
            return bus.at('自动安装引用组件', null, impconf);
        }

        // 没有设定@import，也没有在[import]中配置引用，直接返回该标签
        return tag;
    }

}());

