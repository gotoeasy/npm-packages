
const api = {};

api.sassToCss = require('./lib/scss-to-css');
api.scssToCss = api.sassToCss;
api.lessToCss = require('./lib/less-to-css');
api.formatCss = require('./lib/format-css');
api.miniCss = require('./lib/mini-css');
api.formatJs = require('./lib/format-js');
api.miniJs = require('./lib/mini-js');
api.es5 = require('./lib/es2015');
api.es2015 = api.es2015;

api.babel = require('./lib/babel');

module.exports = api;

