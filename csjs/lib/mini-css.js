
const CleanCSS = require('clean-css');

// CSS压缩
module.exports = function (src, opts={level:2}){

	let rs = new CleanCSS(opts).minify(src);

	rs.warnings.forEach(v=>console.error(v));
	rs.errors.forEach(v=>console.error(v));

	return rs.styles;
};

