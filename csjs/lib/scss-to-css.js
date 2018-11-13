
const File = require('@gotoeasy/file');
const sass = require('node-sass');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = (function(){

	return function(src, file, opts={}){
		let rs;

		try{
			let param = Object.assign({}, opts, {data: src});
			rs = sass.renderSync(param);
		}catch(e){
			console.error(MODULE, 'sass compile failed, file:', file)
			console.error(MODULE, e)
			throw e;
		}

		return rs.css.toString();
	}
})();
