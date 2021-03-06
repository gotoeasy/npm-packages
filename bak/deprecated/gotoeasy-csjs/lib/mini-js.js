
module.exports = function s(src, opts={ecma:8}){
	const uglifyEs = require("uglify-es");
	let rs = uglifyEs.minify(src, opts);
	if ( rs.error ) {
		console.error(rs.error) 
		return src;
	}

	return rs.code;
};

