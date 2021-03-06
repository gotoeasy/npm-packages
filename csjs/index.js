
const api = {};

api.sassToCss = require('./lib/scss-to-css');
api.scssToCss = api.sassToCss;
api.lessToCss = require('./lib/less-to-css');
api.formatCss = require('./lib/format-css');
api.miniCss = require('./lib/mini-css');
api.formatJs = require('./lib/format-js');
api.formatJava = require('./lib/format-java');
api.miniJs = require('./lib/mini-js');

api.babel = require('@gotoeasy/babel');
api.browserify = require('@gotoeasy/browserify');

module.exports = api;

