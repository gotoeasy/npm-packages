// ---------------------------
// ”ü‰»CSS
// ---------------------------
const prettier = require('prettier');

const fmtOpt = { parser: "css", tabWidth: 4 };

module.exports = function(src){
	try{
		return prettier.format(src, fmtOpt);
	}catch(e){
		console.error('format error:', e);
		return src;
	}
};

