// ---------------------------
// 自动添加CSS前缀
// ---------------------------
const autoprefixer = require('autoprefixer');

// 仅支持异步回调处理,回调参数为转换后css
module.exports = function s(){
	const postcss = require('postcss')([autoprefixer]);

	return function (src, callback){
		postcss.process(src).then(rs => {
			callback(rs.css);
		});
	};
};

