const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

function clean(opts){

	try{
		require('./loadModules')();

		bus.at('编译环境', opts);
		bus.at('clean');
	}catch(e){
		console.error(MODULE, Err.cat('clean failed', e).toString());
	}
}


module.exports = clean;

