// ---------------------------
// ”ü‰»JS
// ---------------------------

const fmtOpt = { parser: "babylon", printWidth: 999999, tabWidth: 4 };

module.exports = function(src){
	const prettier = require('prettier');
	try{
		return prettier.format(src, fmtOpt);
	}catch(e){
		console.error('format error:', e);
		return src;
	}
};

