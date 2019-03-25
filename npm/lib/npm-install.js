const syncExec = require('sync-exec');
const npmSearch = require('./npm-search');

module.exports = function(name, opts={}){

    if ( !name ) {
        opts.error && opts.error('');
        return false;
    }

    let pkg = npmSearch(name);
    if ( !pkg ) {
        opts.error && opts.error('');
        return false;
    }

    let sCmd = 'npm install ' + pkg
	console.log('$> ' + sCmd);

    let rs = syncExec(sCmd, opts.timeout || 5*60*1000);
    if ( rs.stderr ) {
        throw new Error(rs.stderr);
    }

    return true;
};
