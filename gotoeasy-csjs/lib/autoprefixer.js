// ---------------------------
// 自动添加CSS前缀
// ---------------------------

// 仅支持异步回调处理,回调参数为转换后css
module.exports = function (src, callback){
	const autoprefixer = require('autoprefixer');
	const postcss = require('postcss')([autoprefixer]);

	postcss.process(src).then(rs => {
		callback(rs.css);
	});
};
