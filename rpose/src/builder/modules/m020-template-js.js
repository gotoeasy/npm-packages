const File = require('@gotoeasy/file');
const Btf = require('@gotoeasy/btf');
const bus = require('@gotoeasy/bus');
const error = require('@gotoeasy/error');
const PTask = require('@gotoeasy/p-task');
const ClsTemplate = require('../ClsTemplate');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('编译模板JS', function(){

	let ptask = new PTask((resolve, reject, isBroken) => async function(){
		try{
			console.debug('----------- m020-template-js ----------- (js component template)');

			let dirname = __dirname.replace(/\\/g, '/');
			let fileNm = dirname.substring(0, dirname.lastIndexOf('/')) + '/tmpl-js/template-js.btf';
			const btf = new Btf(fileNm);
			const clsTemplate = new ClsTemplate(btf.getText('template').replace(/\\/g, "\\\\"), '$data');
			resolve(clsTemplate.toString);
		}catch(e){
			reject( error(MODULE + 'build template js failed', 'tmpl-js/template-js.btf', e) );
		}
	});


	return () => ptask.start();

}());

