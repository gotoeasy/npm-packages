
module.exports = {

    autoinstall: require('./lib/autoinstall'),
    isInstalled: require('./lib/is-installed'),
    install: require('./lib/npm-install'),
    uninstall: require('./lib/npm-uninstall'),
    search: require('./lib/npm-search'),
    exists: require('./lib/npm-view'),

    requireAll: require('./lib/require-all'),

    download: require('./lib/download'),
	getRegistryInfo: require('./lib/get-npm-registry-info'),
	getLatestVersion: require('./lib/get-npm-latest-version'),
	getNpmTarball: require('./lib/get-npm-tarball'),
	getPackageJson: require('./lib/get-npm-package-json'),
	tgz: require('./lib/compressing-tgz'),
	unTgz: require('./lib/compressing-un-tgz')
};

