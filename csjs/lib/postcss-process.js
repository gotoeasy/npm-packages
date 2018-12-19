
const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// ------------------------------------------------------------------------
// opts - 选项
//    opts.sass - true：sass/scss （默认false）
//    opts.sassOptions - sass options （默认{}）
//    opts.less - true：less （默认false）
//    opts.lessOptions - less options （默认{}）
//    opts.debug - true:输出各插件运行时间 （默认false）
//    opts.removeComments - true:删除注释 （默认false）
//    opts.rename - 插件postcss-rename-classname的类名修改函数 （默认不修改）
//    opts.format - true:格式化代码 （默认false）
//    opts.callback - 传入回调函数则回调[callback(rs, err)]，否则返回Promise对象
//    opts.postcssOptions - postcss options （默认{}）
// ------------------------------------------------------------------------
module.exports = async function (src, opts={}){

	const File = require('@gotoeasy/file');

	// 默认删除注释，压缩优化
	opts.removeComments = (opts.removeComments == undefined ? true : opts.removeComments);

	let css = src;

	// SASS编译
	if ( opts.sass || opts.scss ) {
		css = require('./scss-to-css')(src, opts.sassOptions);
	}

	// LESS编译
	if ( opts.less ) {
		try{
			let lessRs = await require('./less-to-css')(src, opts.lessOptions);
			css = lessRs.css;
		}catch(e){
			console.error(MODULE, 'less compile failed')
			console.error(MODULE, e)
			throw e;
		}
	}

	// CSS后处理
	let from = opts.from || 'from.css';
	let to = opts.to || 'to.css';
	let assetsPath = opts.assetsPath || File.relative(to, File.path(to) + '/images');
	let postcssUrlOpt = {url: 'copy', from, to, basePath:File.path(from), assetsPath, useHash: true};
	let plugins = [];
	opts.debug && plugins.push( require('postcss-devtools') );									// 输出各插件处理时间
	plugins.push( require('postcss-preset-env')({stage: 3}) );									// 默认支持使用stage3新特性，已含autoprefixer处理
	opts.normalize && plugins.push( require('postcss-normalize') );								// 按需引用normalize.css内容
	plugins.push( require('postcss-import')() );												// 导入@import文件内容
	opts.removeComments && plugins.push( require('postcss-discard-comments')({remove:x=>1}) );	// 删除所有注释
	plugins.push( require('postcss-normalize-whitespace') );									// 压缩删除换行空格
	plugins.push( require('postcss-minify-selectors') );										// 压缩删除选择器空白（h1 + p, h2, h3, h2{color:blue} => h1+p,h2,h3{color:blue}）
	plugins.push( require('postcss-minify-params') );											// 压缩删除参数空白（@media only screen   and ( min-width: 400px, min-height: 500px    ){} => @media only screen and (min-width:400px,min-height:500px){}）
	plugins.push( require('postcss-svgo') );													// 压缩svg
	plugins.push( require('postcss-discard-empty') );											// 删除空样式（@font-face;h1{}{color:blue}h2{color:}h3{color:red} => h3{color:red}）
	plugins.push( require('postcss-normalize-string') );										// 统一写法（'\\'abc\\'' => "'abc'"）
	plugins.push( require('postcss-normalize-display-values') );								// 统一写法（{display:inline flow-root} => {display:inline-block}）
	plugins.push( require('postcss-normalize-positions') );										// 统一写法（{background-position:bottom left} => {background-position:0 100%}）
	plugins.push( require('postcss-normalize-repeat-style') );									// 统一写法（{background:url(image.jpg) repeat no-repeat} => {background:url(image.jpg) repeat-x}）
	plugins.push( require('postcss-minify-font-values') );										// 统一写法（{font-family:"Helvetica Neue";font-weight:normal} => {font-family:Helvetica Neue;font-weight:400}）
	plugins.push( require('postcss-minify-gradients') );										// 统一写法（{background:linear-gradient(to bottom,#ffe500 0%,#ffe500 50%,#121 50%,#121 100%)} => {background:linear-gradient(180deg,#ffe500 0%,#ffe500 50%,#121 0,#121)}）
	plugins.push( require('postcss-color-hex-alpha') );											// 统一写法（{color:#9d9c} => {color:rgba(153,221,153,0.8)}）
	plugins.push( require('postcss-merge-longhand') );											// 统一写法（h1{margin-top:10px;margin-right:20px;margin-bottom:10px;margin-left:20px} => h1{margin:10px 20px}）
	plugins.push( require('postcss-combine-duplicated-selectors') );							// 合并重名选择器（p{color:green}p{font-size:1rem} => p{color:green;font-size:1rem}）
	plugins.push( require('postcss-discard-duplicates') );										// 删除重复样式（p{color:green}p{color:green;color:green} => p{color:green}）
	plugins.push( require('postcss-merge-rules') );												// 合并选择器（.a{color:green;font-size:1rem}.b{color:green} => .a{font-size:1rem}.a,.b{color:green}）
	plugins.push( require("postcss-url")(postcssUrlOpt) );										// 修改url并复制图片哈希图片文件名
	opts.rename && plugins.push( require('postcss-rename-classname')({rename: opts.rename}) );	// 自定义修改类名
	opts.format && plugins.push( require('stylefmt') );											// 格式化代码

	return require('postcss')(plugins).process(css, {from, to});
};

