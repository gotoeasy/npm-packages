const File = require('@gotoeasy/file');

module.exports = (function(){

	const download = require('./download');
	const path = require('./homedir')() + '/.temp';
	File.mkdir(path);

	return async function(pkgName, version='latest'){
		let url = `https://registry.npmjs.org/${pkgName}/${version}`;
		if ( pkgName.indexOf("@") >= 0 ) {
			url = `https://registry.npmjs.org/${pkgName}/`; // @sope时不能指定版本?!!!
		}

		let rs = await download(url);
		if ( rs.error ) {
			return JSON.parse(rs.error);
		}else{
			let txt = File.read(rs.file);
			File.remove(rs.file);
			return JSON.parse(txt);
		}
	}

})();
