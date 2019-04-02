const prettier = require("prettier");

const optPrettier = { parser: "css", printWidth: 150, tabWidth: 4 };

// CSS美化
module.exports = function (css){

	try{
		return prettier.format(css, optPrettier);
	}catch(e){
		throw new Error('prettier format css failed\n' + e);
	}

};

