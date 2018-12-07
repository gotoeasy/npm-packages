const babel = require('@babel/core');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

// babel转译
module.exports = (function(){

	return function(code, opts={}){
		try{
			return babel.transformSync(code, opts);
		}catch(e){
			console.error(MODULE, 'babel transform failed')
			throw e;
		}
	}
})();
