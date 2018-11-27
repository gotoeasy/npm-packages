// ---------------------------
// 美化JS
// ---------------------------

const optUglify = {
	compress: false,		// 不压缩
	mangle: false,			// 不混淆
    output: {
        bracketize: true,	// 总是要{}包围语句
        beautify: true,		// 要美化
        comments: false,	// 删除注释
        width: 150			// 行宽150
    },
    keep_classnames: true,	// 不修改类名
    keep_fnames: true,		// 不修函数名
};

function uglify(src){
	let rs = require("uglify-es").minify(src, optUglify);
	if ( rs.error ) {
		console.error(rs.error); // 要抛异常否？
		return src;
	}

	return rs.code;
};


const optPrettier = { parser: "babylon", printWidth: 150, tabWidth: 4 };

function prettier(src){
	try{
		return require('prettier').format(src, optPrettier);
	}catch(e){
		console.error('format error:', e);
		return src;
	}
};

// 呃... 删除注释用uglify-es， 保留注释用prettier
module.exports = function formatJs(src, removeComments){
	return removeComments ? uglify(src) : prettier(src);
}