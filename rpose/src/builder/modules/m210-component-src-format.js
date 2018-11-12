const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('组件代码美化', function(){

	return function(tags, components){

		tags.forEach(tag => {
			let comp = components[tag];
			try{
				comp.js && ( comp.js = csjs.formatJs(comp.js) );
			}catch(e){
				console.error(MODULE, comp.js);
				throw e;
			}

			try{
				comp.css && ( comp.css = csjs.formatCss(comp.css) );
			}catch(e){
				console.error(MODULE, comp.css);
				throw e;
			}
		});

		console.debug(MODULE, 'format js/css', tags);

	};

}());
