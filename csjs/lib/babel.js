
const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

// babel转译
module.exports = function(code, opts={}){
	try{
		return require('@babel/core').transformSync(code, opts);
	}catch(e){
		console.error(MODULE, 'babel transform failed')
		throw e;
	}
}