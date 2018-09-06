const less = require('less');


// opts注意设定filename以便正确处理imports
module.exports = function(src, opts={}){
	let css;
	less.render(src, opts, (err, rs) => css = err ? console.info(err) : rs.css);
	return css;
}
