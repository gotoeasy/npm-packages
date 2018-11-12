const bus = require('@gotoeasy/bus');

function clean(opts){
	require('./loadModules')();

	bus.at('编译环境', opts);
	bus.at('clean');
}


module.exports = clean;

