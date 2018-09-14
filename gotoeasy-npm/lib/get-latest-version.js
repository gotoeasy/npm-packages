


module.exports = async function(pkgName){

	let getRegistryInfo = require('./get-registry-info');
	let jsonObj = await getRegistryInfo(pkgName);

	return jsonObj.error ? null : jsonObj['dist-tags'].latest;
				
}

