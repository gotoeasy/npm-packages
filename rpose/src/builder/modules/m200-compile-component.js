const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('组件编译', function(){

	return function(file, btf, components){

		let fnTmpl = bus.at('编译模板JS');

		btf.getDocuments().forEach(doc => {
			try{
				components[doc.getText('tag')] = { js: fnTmpl(doc), css: doc.getText('css') };
			}catch(e){
				console.error(MODULE, 'compile file:', file, fnTmpl);
				throw e;
			}
		});

		console.debug(MODULE, 'compile file:', file);

	};

}());

