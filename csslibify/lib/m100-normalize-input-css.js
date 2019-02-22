const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const PTask = require('@gotoeasy/p-task');
const postcss = require('postcss');

// 整理输入样式
// 去前缀、删注释、复制url资源、静态化变量
module.exports = bus.on('normalize-input-css', function(){

    let ptask = new PTask((resolve, reject, isBroken, hashcode) => async function(css, fromPath, toPath, assetsPath){

        let cachefile = File.resolve(bus.at('get-cache-path'), 'normalized-' + hashcode() + '.css');
        if ( File.existsFile(cachefile) ) return resolve( File.read(cachefile) );


        // 修改url并复文件哈希化文件名
        let url = 'copy';
        let from = fromPath + '/from.css';
        let to = toPath + '/to.css';
        let basePath = fromPath;
        let useHash = true;
        let hashOptions = { method: contents => hash({contents}) };
        let postcssUrlOpt = {url, from, to, basePath, assetsPath, useHash, hashOptions };

	    let plugins = [];
        plugins.push( require('postcss-unprefix')() );                          // 删除前缀（含@规则、属性名、属性值，如果没有会自动补足无前缀样式）
        plugins.push( require('postcss-discard-comments')({remove:x=>1}) );     // 删除所有注释
        plugins.push( require('postcss-url')(postcssUrlOpt) );                  // url资源复制
        plugins.push( require('postcss-nested')() );                            // 支持嵌套（配合下面变量处理）
        plugins.push( require('postcss-css-variables')() );                     // 把css变量静态化输出
        plugins.push( bus.at('normalize-plugin-to-single-selector') );          // 拆分为单个规则
        plugins.push( require('stylefmt') );                                    // 格式化

        try{
            let rs = await postcss(plugins).process(css, {from});
            File.write(cachefile, rs.css);
            resolve( rs.css );
        }catch(err){
            reject(err);
        }
    });


    // -------------------------------------------------------------
    // css          : 样式内容 （必须输入）
    // fromPath     : 样式来源目录 （必须输入）
    // toPath       : 样式输出目录 （必须输入）
    // assetsPath   : 样式url目录 （必须输入）
    // -------------------------------------------------------------
	return (css, fromPath, toPath, assetsPath) => {

        return ptask.start(css, fromPath, toPath, assetsPath);
    }

}());

