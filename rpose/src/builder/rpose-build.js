const bus = require('@gotoeasy/bus');


module.exports = function build(opts){
	(async function(){
console.time('build');

		try{
			require('./loadModules')();

			let env = bus.at('编译环境', opts);
			bus.at('clean');

			await bus.at('编译全部页面');
		}catch(e){
			console.error(e);
			throw e;
		}

console.timeEnd('build');
	})();
}

