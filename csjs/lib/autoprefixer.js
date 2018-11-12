// ---------------------------
// 自动添加CSS前缀
// ---------------------------

// 传入callback则自动回调，不传callback则返回Promise
module.exports = function (src, callback){
	const autoprefixer = require('autoprefixer');
	const postcss = require('postcss')([autoprefixer]);

	if ( callback ) {
		postcss.process(src).then(rs => {
			rs.warnings().forEach( w => console.warn(w.toString()) );
			callback(rs.css);
		});
	}else{
		return new Promise(function(resolve, reject){
			postcss.process(src).then(rs => {
				rs.warnings().forEach( w => console.warn(w.toString()) );
				resolve(rs.css);
			});
		});
	}
};
