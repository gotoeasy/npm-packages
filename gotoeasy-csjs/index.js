
module.exports = {
	es5: require('./lib/es2015'),
	es2015: require('./lib/es2015'),
	lessToCss: require('./lib/less-to-css'),
	autoprefixer: require('./lib/autoprefixer'),	// 返回Promise，或第二参数传入回调函数自动回调
	cssUrl: require('./lib/css-url'),				// 转换url引用路径，复制图片，压缩生成新的css
	formatCss: require('./lib/format-css'),
	miniCss: require('./lib/mini-css'),
	formatJs: require('./lib/format-js'),
	miniJs: require('./lib/mini-js')
};

