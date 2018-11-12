
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('源文件标签', function(){

	return function(file, btf){
		
		let pageTag = file.substring(file.lastIndexOf('/')+1).split('.')[0].toLowerCase();
		let result = [];
		let docs = btf.getDocuments();
		for ( let i=0; i<docs.length; i++ ) {
			let tag = (docs[i].getText('tag') || '').trim();
			if ( tag ) {
				tag = tag.trim().toLowerCase();
			}else{
				tag = pageTag;
			}

			result.push(tag ? tag.toLowerCase() : file.substring(file.lastIndexOf('/')+1).split('.')[0].toLowerCase() );
		}

		console.debug(MODULE, result);

		return result;
	};

}());

