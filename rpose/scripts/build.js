const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');

let path = __dirname.replace(/\\/g, '/');
path = path.substring(0, path.lastIndexOf('/'));

let srcDir = path + '/src/rpose';								// 源码目录
let fileDist = path + '/src/rpose/dist/rpose.js';				// 目标文件

let js = File.concat(srcDir, f=>!f.endsWith('rpose.js'));		// 合并rpose.js以外的全部js文件

let src = csjs.formatJs(js, true);								// 删除注释格式化
File.write(fileDist, src);										// 输出到目标文件
console.log('rpose build ok:', fileDist);

