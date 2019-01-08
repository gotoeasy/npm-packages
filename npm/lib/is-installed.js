
const isInstalled = require('is-installed');


module.exports = function (moduleName, opts){

	return isInstalled.sync(moduleName, opts);
};

