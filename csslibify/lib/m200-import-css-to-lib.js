const bus = require('@gotoeasy/bus');
const os = require('@gotoeasy/os');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const postcss = require('postcss');

// -------------------------------------------------------------
// pkg                  : 样式库别名 （必须输入）
// fileOrCss            : 样式文件或内容 （必须输入）
// opt.basePath         : 样式所在目录 （文件时默认为文件所在目录，内容时默认当前目录）
// opt.assetsPath       : 修改后的url资源目录 （默认复制资源后使用该资源的绝对路径）
/////////////////////////////////////// opt.usecache         : 是否使用缓存 （默认true）
/////////////////////////////////////// opt.rename           : 样式类名的改名函数 （默认(pkgnm, cls) => `${pkgnm?(pkgnm+'---'):''}${cls}`）
// -------------------------------------------------------------
module.exports = bus.on('import-css-to-lib', function(){

	return async function(pkg, fileOrCss, opt={}){

        let inputCss = File.existsFile(fileOrCss) ? File.read(fileOrCss) : fileOrCss;
//        let hashcode = hash(inputCss);
        //let csslibfile = File.resolve(bus.at('get-cache-path'), `${pkg?('csslib-'+pkg+'-'+hashcode):'csslib-'+hashcode}.json`);
        let csslibfile = File.resolve(bus.at('get-cache-path'), `${pkg?('csslib-'+pkg):'csslib'}.json`);

        let fromPath = File.existsFile(fileOrCss) ? File.path(fileOrCss) : ( opt.basePath || './' );
        let toPath = File.path(csslibfile);
        let assetsPath = opt.assetsPath || toPath;
//        let usecache = opt.usecache === undefined ? true : opt.usecache;
//        let fnRename = opt.rename || ( (pkgnm, cls) => `${pkgnm?(pkgnm+'---'):''}${cls}` );   // 默认策略：pkgname---classname


        // 整理输入样式
        let css = await bus.at('normalize-input-css', inputCss, fromPath, toPath, assetsPath);

        // 使用插件方式处理
        let rs = await postcss( bus.at('get-split-postcss-plugins') ).process(css, {from: File.resolve(toPath, 'from.css')});

        File.write(csslibfile.replace('.json','-todo.css'), rs.css);

        // let oResult = {pkg, keyframes, nodes, basePath: toPath};
        File.write(csslibfile, JSON.stringify(rs.csslib, null, 2));
        
        bus.at('csslib-data', pkg, rs.csslib);
        rs.csslib.pkg = pkg;
        rs.csslib.get = bus.on('get-relative-css')[0];

        let tmp = [];
        rs.csslib.nodes.forEach(node => tmp.push(node.toString('',(p,n)=>n)));
        File.write(csslibfile.replace('.json','-finish.css'), tmp.join('\n'));

        return rs.csslib;
    }

}());

