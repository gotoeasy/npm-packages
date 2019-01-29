const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const npm = require('@gotoeasy/npm');
const os = require('@gotoeasy/os');

module.exports = bus.on('import-from-npm', function(){

    // 从npm导入svf图标文件
	return async (pkgName) => {

        let pkgVersion = await npm.getLatestVersion(pkgName);
        if ( !pkgVersion ) {
            console.debug('npm package not found:', pkgName);
            return;
        }

        let hashcode = hash(`${pkgName}\n${pkgVersion}`);
        if ( bus.at('cache-file', hashcode) ) {
            console.debug('allready imported:', `${pkgName}@${pkgVersion}`);
            return; // 已处理
        }


        let oRs = await npm.getNpmTarball(pkgName, pkgVersion);
        console.debug('download ok:', `${pkgName}@${pkgVersion}`);

        let pathTmp = File.resolve(process.cwd(),  './temp' + new Date().getTime());
        await npm.unTgz(oRs.file, pathTmp);
        console.debug('untgz ok:', `${pathTmp}`);

        await bus.at('svgicons-normalize-to-svg-data', pathTmp);
        File.remove(pathTmp);

        bus.at('cache-file', hashcode, 1); // 已处理标记
        console.debug('import ok:', `${pkgName}@${pkgVersion}`);
    };

}());

