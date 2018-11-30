const bus = require('@gotoeasy/bus');
const PTask = require('@gotoeasy/p-task');
const File = require('@gotoeasy/file');
const Btf = require('@gotoeasy/btf');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('解析全部源文件', function(){

	return async function () {
		try{
console.info(MODULE, '------------parse all btf-----------');
			let files = bus.at('源文件清单');
			let promises = [];

			files.forEach( file => promises.push(bus.at('解析源文件', file)) )

			await Promise.all(promises);
		}catch(e){
			throw Error.err(MODULE + 'parse all btf failed', e);
		}
	};

}());

