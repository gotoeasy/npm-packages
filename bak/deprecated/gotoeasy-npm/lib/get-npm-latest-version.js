


module.exports = async function(pkgName){

	let getRegistryInfo = require('./get-npm-registry-info');
	let jsonObj = await getRegistryInfo(pkgName);

	return jsonObj.error ? null : jsonObj['dist-tags'].latest;
				
}

