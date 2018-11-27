
const api = {};

api.es5 = require('./lib/es2015');
api.es2015 = api.es2015;
api.sassToCss = require('./lib/scss-to-css');
api.scssToCss = api.sassToCss;
api.lessToCss = require('./lib/less-to-css');
api.autoprefixer = require('./lib/autoprefixer');	// 返回Promise，或第二参数传入回调函数自动回调
api.cssUrl = require('./lib/css-url');				// 转换url引用路径，复制图片，压缩生成新的css
api.formatCss = require('./lib/format-css');
api.miniCss = require('./lib/mini-css');
api.formatJs = require('./lib/format-js');
api.miniJs = require('./lib/mini-js');

module.exports = api;

