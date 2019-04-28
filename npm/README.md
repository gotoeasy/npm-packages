# @gotoeasy/npm
npm相关操作封装
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/npm.svg)](https://www.npmjs.com/package/@gotoeasy/npm)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/gotoeasy/npm-packages/blob/master/LICENSE)
<br>
<br>

## Install
```
npm i @gotoeasy/npm
```


## Sample
```js
const npm = require('@gotoeasy/npm');

(async function(){

	// 从指定url下载，保存到本地指定文件
	let down = await npm.download('https://registry.npmjs.org/@gotoeasy/npm/-/npm-0.0.1.tgz', 'd:/@gotoeasy-npm.0.0.1.tgz');
	console.info(down); // { file: 'd:/@gotoeasy-npm.0.0.1.tgz' }

	// 从registry.npmjs.org取指定包的注册信息
	let objInfo = await npm.getRegistryInfo('@gotoeasy/npm');
	console.info(objInfo); // { _id: '@gotoeasy/npm', ...... }

	// 取指定包的最新版本号（不存在时为null）
	let ver = await npm.getLatestVersion('@gotoeasy/npm');
	console.info(ver); // 0.0.3
	let ver = await npm.getLatestVersion('gotoeasy');
	console.info(ver); // 0.0.1

	// 取指定包指定版本的tarball文件，首次自动下载，再次使用已下载文件
	let rs = await npm.getNpmTarball('gotoeasy', '0.0.1');
	console.info(rs.file); // %homedir%/.npm-tarballs/gotoeasy-0.0.1.tgz


	// 取指定包的package信息，版本不传则默认取最新版本，包名含组织时取全部版本的注册信息
	let obj1 = await npm.getPackageJson('@gotoeasy/npm');
	console.info(obj1); // {_id: '@gotoeasy/npm', ....}
	let obj2 = await npm.getPackageJson('@gotoeasy/util', '0.0.2');
	console.info(obj2); // {_id: '@gotoeasy/util', ....}


	// 指定目录压缩为指定的tgz文件
	await npm.tgz('d:/a', 'd:/a-test.tgz');

	// 指定tgz文件解压到指定目录
	await npm.unTgz('d:/@gotoeasy-npm.0.0.1.tgz', 'd:/test1/@gotoeasy-npm');

})();

```
<br>


## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

