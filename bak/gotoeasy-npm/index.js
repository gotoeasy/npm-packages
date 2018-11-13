
module.exports = {
	download: require('./lib/download'),
	getRegistryInfo: require('./lib/get-npm-registry-info'),
	getLatestVersion: require('./lib/get-npm-latest-version'),
	getNpmTarball: require('./lib/get-npm-tarball'),
	getPackageJson: require('./lib/get-npm-package-json'),
	tgz: require('./lib/compressing-tgz'),
	unTgz: require('./lib/compressing-un-tgz')
};

