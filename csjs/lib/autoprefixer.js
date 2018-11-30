// ---------------------------
// 自动添加CSS前缀
// ---------------------------
const autoprefixer = require('autoprefixer');
const postcss = require('postcss')([autoprefixer]);

// 传入callback则自动回调，不传callback则返回Promise
module.exports = (function(){
	
	autoprefixer({env: 'last 3 versions'});
	
	return function (src, callback){
		if ( callback ) {
			postcss.process(src, {from: undefined}).then(rs => {
				rs.warnings().forEach( w => console.warn(w.toString()) );
				callback(rs.css);
			});
		}else{
			return new Promise(function(resolve, reject){
				postcss.process(src, {from: undefined}).then(rs => {
					rs.warnings().forEach( w => console.warn(w.toString()) );
					resolve(rs.css);
				});
			});
		}
	}

})();
