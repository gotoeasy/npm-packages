const postcss = require("postcss");
const postcssUrl = require("postcss-url");
const File = require('@gotoeasy/file');
const miniCss = require("./mini-css");

// basePath : 源CSS文件目录
// basePath : CSS内容
// cssFileTo : 生成的目标CSS文件全路径
// assetsPath : 目标CSS文件中使用的新的url相对目录
// callback : 传入此回调函数的话，异步回调。否则同步处理后返回
module.exports =  function cssUrl(basePath, css, cssFileTo, assetsPath, callback){

	const options = {
		url: 'copy',

		from: 'style.css',
		to: cssFileTo,
		
		basePath: basePath,
		assetsPath: assetsPath,		// '../images',			// css文件所在目录中建img文件夹存放图片
		useHash: true				// hash图片文件名
	};

	if ( callback ) {
		postcss().use(postcssUrl(options)).process(css, {from: options.from, to: options.to})
			.then(rs=>callback(rs.css));
	}else{
		return postcss().use(postcssUrl(options)).process(css, {from: options.from, to: options.to});
	}


};

