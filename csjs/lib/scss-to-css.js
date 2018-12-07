
const File = require('@gotoeasy/file');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

// SASS编译
module.exports = (function(){

	return function(src, opts={}){
		let rs;

		try{
			let param = Object.assign({}, opts, {data: src});
			rs = require('node-sass').renderSync(param);
		}catch(e){
			console.error(MODULE, 'sass compile failed')
			console.error(MODULE, e)
			throw e;
		}

		return rs.css.toString();
	}
})();
