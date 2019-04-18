// ------------------------------------------------------------------------------------------
// copy from css-mqpacker@7.0.0 because of the package has been deprecated
// copy from sort-css-media-queries@1.4.3 for the deprecated package css-mqpacker
// ------------------------------------------------------------------------------------------
const cssMqpacker = require('./css-mqpacker');
const sortCssMediaQueries = require('./sort-css-media-queries');
const postcss = require('postcss');

// ----------------------------------------
// 对@media进行排序，默认为移动优先
// ----------------------------------------
module.exports = postcss.plugin('postcss-sort-media', function (options={desktopFirst: false}) {

    return function (root, result) {
        let sort = options && options.desktopFirst ? sortCssMediaQueries.desktopFirst : sortCssMediaQueries;
        return cssMqpacker({sort})(root);
    };

});

