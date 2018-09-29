// ---------------------------
// ”ü‰»JS
// ---------------------------

const fmtOpt = { parser: "babylon", printWidth: 150, tabWidth: 4 };

module.exports = function(src){
	const prettier = require('prettier');
	try{
		return prettier.format(src, fmtOpt);
	}catch(e){
		console.error('format error:', e);
		return src;
	}
};

