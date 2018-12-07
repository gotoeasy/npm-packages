
// JS压缩
module.exports = function(src, opts={ecma:8}){
	let rs = require("uglify-es").minify(src, opts);
	if ( rs.error ) {
		console.error(rs.error) 
		return src;
	}

	return rs.code;
};

