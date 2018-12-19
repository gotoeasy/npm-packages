const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = function build(opts){
	(async function(){
console.time('build');

		try{
console.time('load');
			require('./loadModules')();
console.timeEnd('load');

			let env = bus.at('编译环境', opts);
			bus.at('clean');

			await bus.at('编译全部页面');
		}catch(e){
			console.error(MODULE, 'build failed\n   ', e.stack);
		}

console.timeEnd('build');
	})();
}

