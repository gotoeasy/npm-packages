const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const postcss = require('postcss');

// -------------------------------------------------------------
// fileOrCss            : 样式文件或内容 （必须输入）
// opt.basePath         : 样式所在目录 （文件时默认为文件所在目录，内容时默认当前目录）
// opt.assetsPath       : 修改后的url资源目录 （默认复制资源后使用该资源的绝对路径）
module.exports = bus.on('import-css-to-lib', function(){

	return function(fileOrCss, opt={}){

        let inputCss = File.existsFile(fileOrCss) ? File.read(fileOrCss) : fileOrCss;
        let hashcode = hash( inputCss + 'basePath:' + (opt.basePath || '') + 'assetsPath:' + (opt.assetsPath || '') );
        let csslibfile = `${bus.at('get-cache-path')}/imp-${hashcode}.json`;

        let nodes;
        if ( File.existsFile(csslibfile) ) {
            // 直接读取缓存
            nodes = JSON.parse(File.read(csslibfile));
            nodes.forEach(node => node.toString = bus.at('template-to-tostring', node.template, ...(node.classes||[])));   // 添加toString方法
            mergeNodes(this.nodes, nodes);  // 导入的nodes加到当前库nodes中，重复则不加
            return this;
        }

        let fromPath = File.existsFile(fileOrCss) ? File.path(fileOrCss) : ( opt.basePath || './' );
        let toPath = File.path(csslibfile);
        let assetsPath = opt.assetsPath || toPath;

        // 整理输入样式
        let css = bus.at('normalize-input-css', inputCss, fromPath, toPath, assetsPath);

        // 使用插件方式处理
        let processResult = {nodes:[]};
        bus.at('process-result-of-split-postcss-plugins', processResult); // 重置处理结果
        let rs = postcss( bus.at('get-split-postcss-plugins') ).process(css, {from: File.resolve(toPath, 'from.css')}).root.toResult();
        nodes = processResult.nodes;
        mergeNodes(this.nodes, nodes);  // 导入的nodes加到当前库nodes中，重复则不加

        // ----------------------------------
        if ( rs.css ) {
            let tmp = [];
            nodes.forEach(node => tmp.push(node.toString('',(p,n)=>n)));
            File.write(csslibfile.replace('.json','-finish.css'), tmp.join('\n'));
            File.write(csslibfile.replace('.json','-todo.css'), rs.css);
        }
        File.write(csslibfile, JSON.stringify(this.nodes, null, 2));
        // ----------------------------------

        return this;
    }

}());


function mergeNodes(nodes1, nodes2){
    let oSet = new Set();
    nodes1.forEach(n => oSet.add(JSON.stringify(n)));
    nodes2.forEach(n => {
        let cd = JSON.stringify(n);
        !oSet.has(cd) && oSet.add(cd) && nodes1.push(n);
    });
}