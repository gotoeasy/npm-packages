
// CSS压缩
module.exports = function (css, opts={}){

	opts.removeComments = (opts.removeComments === undefined ? true : opts.removeComments ); // 默认删除注释

	return require('./postcss-process')(css, opts);
};

