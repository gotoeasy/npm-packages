const Err = require('@gotoeasy/err');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');

module.exports = bus.on('生成页面HTML代码', function(){

    return async function(srcFile){
    
        let env = bus.at('编译环境');
        let btf = await bus.at('解析源文件', srcFile);
        let doc = btf.getDocument();

        let srcPath = env.path.src;
        let file = srcFile;
        let name = File.name(srcFile);
        let type = doc.prerender;
        return require(env.prerender)({srcPath, file, name, type});
    }

}());

