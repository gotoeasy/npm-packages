const bus = require('@gotoeasy/bus');
const os = require('@gotoeasy/os');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const PTask = require('@gotoeasy/p-task');
const cssSelectorClasses = require('@gotoeasy/css-selector-classes');
const cssSelectorElements = require('@gotoeasy/css-selector-elements');
const postcss = require('postcss');


// 存取样式库数据
module.exports = bus.on('csslib-data', function(rs={}){

	return (pkg='*', oResult) => {
        if ( oResult !== undefined ) {
            rs[pkg] = oResult;
        }
        return rs[pkg];
    }

}());

