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

function uglifyFormat(src){
	let rs = require("uglify-es").minify(src, optUglify);
	if ( rs.error ) {
		throw new Error('uglify-es format js failed\n' + rs.error);
	}

	return rs.code;
};


const optPrettier = { parser: "babylon", printWidth: 150, tabWidth: 4 };

function prettierFormat(src){
	try{
		return require("prettier").format(src, optPrettier);
	}catch(e){
		throw new Error('prettier format js failed\n' + e);
	}
};

// 呃... 删除注释用uglify-es， 保留注释用prettier
module.exports = function formatJs(src, removeComments){
	return removeComments ? uglifyFormat(src) : prettierFormat(src);
}