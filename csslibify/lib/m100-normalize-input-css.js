const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const postcss = require('postcss');

// 整理输入样式
// 去前缀、删注释、复制url资源、静态化变量等
module.exports = bus.on('normalize-input-css', function(){

    // -------------------------------------------------------------
    // 同步处理，仅支持同步插件
    // 
    // css          : 样式内容 （必须输入）
    // fromPath     : 样式来源目录 （必须输入）
    // toPath       : 样式输出目录 （必须输入）
    // assetsPath   : 样式url目录 （必须输入）
    // -------------------------------------------------------------
	return (css, fromPath, toPath, assetsPath) => {

        let hashcode = JSON.stringify([css, fromPath, toPath, assetsPath]);
        let cachefile = File.resolve(bus.at('get-cache-path'), 'normalized-' + hashcode + '.css');
        if ( File.existsFile(cachefile) ) return File.read(cachefile);

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
        plugins.push( require('postcss-normalize-whitespace') );				// 压缩删除换行空格
        plugins.push( require('postcss-minify-selectors') );					// 压缩删除选择器空白（h1 + p, h2, h3, h2{color:blue} => h1+p,h2,h3{color:blue}）
        plugins.push( require('postcss-minify-params') );						// 压缩删除参数空白（@media only screen   and ( min-width: 400px, min-height: 500px    ){} => @media only screen and (min-width:400px,min-height:500px){}）
        plugins.push( require('postcss-normalize-string') );					// 统一写法（'\\'abc\\'' => "'abc'"）
        plugins.push( require('postcss-normalize-display-values') );			// 统一写法（{display:inline flow-root} => {display:inline-block}）
        plugins.push( require('postcss-normalize-positions') );					// 统一写法（{background-position:bottom left} => {background-position:0 100%}）
        plugins.push( require('postcss-normalize-repeat-style') );				// 统一写法（{background:url(image.jpg) repeat no-repeat} => {background:url(image.jpg) repeat-x}）
        plugins.push( require('postcss-minify-font-values') );					// 统一写法（{font-family:"Helvetica Neue";font-weight:normal} => {font-family:Helvetica Neue;font-weight:400}）
        plugins.push( require('postcss-minify-gradients') );					// 统一写法（{background:linear-gradient(to bottom,#ffe500 0%,#ffe500 50%,#121 50%,#121 100%)} => {background:linear-gradient(180deg,#ffe500 0%,#ffe500 50%,#121 0,#121)}）
        plugins.push( require('postcss-color-hex-alpha') );						// 统一写法（{color:#9d9c} => {color:rgba(153,221,153,0.8)}）
        plugins.push( require('postcss-merge-longhand') );						// 统一写法（h1{margin-top:10px;margin-right:20px;margin-bottom:10px;margin-left:20px} => h1{margin:10px 20px}）
        plugins.push( bus.at('normalize-plugin-to-single-selector') );          // 拆分为单个规则
        plugins.push( require('postcss-discard-empty') );						// 删除空样式（@font-face;h1{}{color:blue}h2{color:}h3{color:red} => h3{color:red}）


        let rs = postcss(plugins).process(css, {from}).root.toResult();
        return rs.css;
    }

}());

