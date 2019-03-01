const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const npm = require('@gotoeasy/npm');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = function build(opts){
	(async function(){

console.time('load');
			npm.requireAll(__dirname, 'modules/m*.js');
console.timeEnd('load');


console.time('build');
		try{
			let env = bus.at('编译环境', opts);
			bus.at('clean');

			await bus.at('编译全部页面');
		}catch(e){
			console.error(MODULE, Err.cat('build failed', e).toString());
		}
console.timeEnd('build');

	})();
}

