// ---------------------------
// 美化Java
// ---------------------------
const optPrettier = { parser: "java", printWidth: 150, tabWidth: 4 };

function prettierFormat(src){
	try{
		return require("prettier").format(src, optPrettier);
	}catch(e){
		throw new Error('prettier format java failed\n' + e);
	}
};

module.exports = function formatJs(src){
	return prettierFormat(src);
}