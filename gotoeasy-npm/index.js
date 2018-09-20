
module.exports = {
	download: require('./lib/download'),
	getRegistryInfo: require('./lib/get-registry-info'),
	getLatestVersion: require('./lib/get-latest-version'),
	getNpmTarball: require('./lib/get-npm-tarball'),
	unTgz: require('./lib/compressing-un-tgz'),
	gzip: require('./lib/compressing-gzip'),
	unGzip: require('./lib/compressing-un-gzip'),
};

