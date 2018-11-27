
// 缓存locale名到文件
module.exports = (function(locale){

	return function(){
		if ( locale ) return locale;

		locale = require('./locale-cache');
		if ( locale ) return locale;

		locale = require('os-locale').sync();

		let fileLocaleCache = __dirname + '/locale-cache.js';
		require('@gotoeasy/file').write(fileLocaleCache, `module.exports = '${locale}';`);

		return locale;
	};

})();

