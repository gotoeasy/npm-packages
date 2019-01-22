const Err = require('@gotoeasy/err');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');

module.exports = bus.on('生成页面HTML代码', function(){

    // TODO 优化，增量写文件
    return async function(srcFile){
    
        let env = bus.at('编译环境');
        let oParse = bus.at('解析源文件', srcFile);

        let srcPath = env.path.src;
        let file = srcFile;
        let name = File.name(srcFile);
        let type = oParse.prerender;
        return require(env.prerender)({srcPath, file, name, type});
    }

}());

