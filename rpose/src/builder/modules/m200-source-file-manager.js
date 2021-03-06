const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

(function (fileSet){

    module.exports = bus.on('源文件清单', function (){

        return function(){
            if ( !fileSet ) {
                let env = bus.at('编译环境');
                let files = File.files(env.path.src, '**.rpose');                   // 源文件目录
                let buildinfiles = File.files(env.path.src_buildin, '**.rpose');    // 内置源文件目录
                files.unshift(...buildinfiles);                                     // 添加到数组起始位置
                fileSet = new Set(files);
                return [...fileSet];
            }

            return [...fileSet];
        }

    }());

    module.exports = bus.on('源文件添加', function (){

        return function(...files){
            files.forEach(file => fileSet.add(file));
        }

    }());

    module.exports = bus.on('源文件删除', function (){

        return function(...files){
            files.forEach(file => fileSet.delete(file));
        }

    }());

})();
