
// CSS压缩
module.exports = function (css, opts={}){

	opts.removeComment = (opts.removeComment === undefined ? true : opts.removeComment ); // 默认删除注释

	return require('./postcss-process')(css, opts);
};

