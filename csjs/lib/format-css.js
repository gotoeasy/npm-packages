
// CSS美化
module.exports = function (css, opts){

	opts.format = (opts.format === undefined ? true : opts.format ); // 默认格式化

	return require('./postcss-process')(css, opts);
};

