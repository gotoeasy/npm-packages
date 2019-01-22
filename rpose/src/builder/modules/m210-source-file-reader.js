const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

(function (map = new Map){

    bus.on('源文件读取并缓存', function (){

        return function(...files){
            let changed = false;
            files.forEach(file => {
                let text = File.read(file);
                let hashcode = hash(text);
                
                (!map.has(file) || map.get(file).hashcode !== hashcode ) && (changed = true) && map.set(file, {hashcode, text});
            });

            return changed;
        }

    }());

    bus.on('源文件读取缓存删除', function (){

        return function(...files){
            files.forEach(file => map.delete(file));
        }

    }());

    bus.on('源文件内容', function (){

        return function(file){
            return map.get(file) || {};
        }

    }());

})();
