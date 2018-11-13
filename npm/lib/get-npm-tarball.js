const File = require('@gotoeasy/file');
const download = require('./download');
const getRegistryInfo = require('./get-npm-registry-info');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

// https://registry.npmjs.org/@xxxx/nnnnn/-/nnnnn-vvvvvvvv.tgz
// https://registry.npmjs.org/nnnnn/-/nnnnn-vvvvvvvv.tgz

module.exports = (function(){

	const path = require('./homedir')() + '/.npm-tarballs';
	File.mkdir(path);

	return async function(pkgName, pkgVersion){

		let dist = `${path}/${pkgName}-${pkgVersion}.tgz`;

		// 检查缓存文件
		if ( File.exists(dist) ) {
			return {file:dist};
		}

		// 有组织时创建组织目录
		if ( pkgName.indexOf('/') > 0 ) {
			File.mkdir(path + '/' + pkgName.split('/')[0]);
		}


		// 查询注册信息
		let regist = await getRegistryInfo(pkgName);
		if ( regist.error ) {
			console.error(MODULE, pkgName, regist.error); // not found
			return {error: pkgName + ' ' + regist.error};
		}
		if ( regist.versions[pkgVersion] == null ) {
			console.error(MODULE, pkgName, 'version not found:', pkgVersion);
			return {error: pkgName + ' version not found: ' + pkgVersion};
		}

		// 下载
		return await download(regist.versions[pkgVersion].dist.tarball, dist);
	}

})();
