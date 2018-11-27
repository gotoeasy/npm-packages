const postcss = require("postcss");
const postcssUrl = require("postcss-url");
const File = require('gotoeasy-file');
const miniCss = require("./mini-css");


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

