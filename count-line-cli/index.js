const countLine = require('./lib/index');
const countLineInit = require('./lib/count-line-init');

module.exports = function(opts={}, ... args){

    let mode = opts.mode;

    if ( /^init$/i.test(mode) ) {
        let path = opts.path || process.cwd().replace(/\\/g, '/');
        countLineInit({path});
    }else if ( /^dir$/i.test(mode) ) {
        let path = opts.path || process.cwd().replace(/\\/g, '/');
        let dirs = opts.dirs || args;
        let csv = !!opts.csv;
        let dir = true;
        countLine({path, dirs, csv, dir});
    }else if ( /^giturl$/i.test(mode) ) {
        let clean = !!opts.clean;
        let path = opts.path || process.cwd().replace(/\\/g, '/');
        let urls = opts.urls || args;
        let csv = !!opts.csv;
        let giturl = true;
        countLine({path, urls, csv, giturl});
    }else{
        console.info('invalid arguments');
    }

}
