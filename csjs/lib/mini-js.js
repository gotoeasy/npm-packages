const uglifyEs = require("uglify-es");

// JS压缩
module.exports = function(src, opts={ecma:8}){
	let rs = uglifyEs.minify(src, opts);
	if ( rs.error ) {
		console.error(rs.error) 
		return src;
	}

	return rs.code;
};

