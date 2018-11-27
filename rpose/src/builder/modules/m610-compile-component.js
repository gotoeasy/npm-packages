const File = require('@gotoeasy/file');
const PTask = require('@gotoeasy/p-task');
const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('编译组件', function(){

	// 按源文件编译
	let ptask = new PTask((resolve, reject, isBroken) => async function(file){

		let fnTmpl, doc;
		try{
			fnTmpl = await bus.at('编译模板JS');
		}catch(e){
			console.error(MODULE, 'compile js template failed');
			return reject(e);
		}

		try{
			doc = await bus.at('编译源文件', file);
		}catch(e){
			console.error(MODULE, 'compile btf failed', file);
			return reject(e);
		}

		doc.js = fnTmpl(doc);
		resolve(doc);
	});


	return (file, restart=false) => {
		if ( file.endsWith('.btf') ) {
			return restart ? ptask.restart(file) : ptask.start(file);
		}
		if ( file.indexOf(':') < 0 ) {
			file = bus.at('标签源文件', file);
			return restart ? ptask.restart(file) : ptask.start(file);
		}
		// TODO npm package
		throw new Error('TODO npm pkg')
	};

}());

