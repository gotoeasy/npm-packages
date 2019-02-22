const npm = require('@gotoeasy/npm');
const bus = require('@gotoeasy/bus');


npm.requireAll(__dirname, 'lib/**.js');    // 自动装载lib目录下的全部模块


// -------------------------------------------------------------
// pkg                  : 样式库别名 （必须输入）
// fileOrCss            : 样式文件或内容 （必须输入）
// opt.usecache         : 是否使用缓存 （默认true）
// opt.basePath         : 样式所在目录 （文件时默认为文件所在目录）
// opt.assetsPath       : 修改后的url资源目录 （默认复制资源后使用该资源的绝对路径）
// opt.rename           : 样式类名的改名函数 （默认(pkgnm, cls) => `${pkgnm?(pkgnm+'---'):''}${cls}`）
// -------------------------------------------------------------
const imp = bus.on('import-css-to-lib')[0];        // 导入到样式库

// -------------------------------------------------------------
// opt.pkg              : 库名 （必须）
// opt.elements         : 要引用的样式标签名，数组 （可选）
// opt.classes          : 要引用的样式类名，数组 （可选）
// opt.includeElements  : 是否包含相关的标签样式，布尔，默认false
// -------------------------------------------------------------
const get = bus.on('get-relative-css')[0];         // 从样式库按需引用

module.exports = {imp, get};
