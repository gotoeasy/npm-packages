const File = require('@gotoeasy/file');
const countLine = require('./lib/index');
const countLineInit = require('./lib/count-line-init');

module.exports = function(opts={}, ... args){

    let mode = opts.mode;
    let debug = console.debug;
    console.debug = ()=>{};

    try{
        if ( /^init$/i.test(mode) ) {
            let path = opts.cwd || process.cwd().replace(/\\/g, '/');
            countLineInit({path});
        }else if ( /^dir$/i.test(mode) ) {
            let path = opts.cwd || process.cwd().replace(/\\/g, '/');
            let dirs = opts.dirs || args;
            for ( let i=0; i<dirs.length; i++ ) {
                dirs[i] = File.resolve(path, dirs[i]);
                !File.existsDir(dirs[i]) && (dirs[i] = '');
            }
            dirs = dirs.filter(v=>v.trim());
            let csv = !!opts.csv;
            let dir = true;
            countLine({path, dirs, csv, dir});
        }else if ( /^giturl$/i.test(mode) ) {
            let clean = !!opts.clean;
            let path = opts.cwd || process.cwd().replace(/\\/g, '/');
            let urls = opts.urls || args;
            let csv = !!opts.csv;
            let giturl = true;
            countLine({path, urls, csv, giturl});
        }else{
            console.info('invalid arguments');
        }
    }catch(e){
    }

    console.debug = debug;
}
