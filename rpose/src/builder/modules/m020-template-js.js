
const File = require('@gotoeasy/file');
const Btf = require('@gotoeasy/btf');
const bus = require('@gotoeasy/bus');
const ClsTemplate = require('../ClsTemplate');

module.exports = bus.on('编译模板JS', function(fnToString){

	return () => {

		if ( !fnToString ) {
			dirname = __dirname.replace(/\\/g, '/');
			let fileNm = dirname.substring(0, dirname.lastIndexOf('/')) + '/tmpl-js/template-js.btf';
			const btf = new Btf(fileNm);
			const clsTemplate = new ClsTemplate(btf.getText('template').replace(/\\/g, "\\\\"), '$data');

			console.debug('----------- m020-template-js ----------- (js component template)');
			console.debug(fileNm);
			fnToString = clsTemplate.toString;
		}

		return fnToString;
	}

}());

