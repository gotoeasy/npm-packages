const execa = require('execa');
const npmView = require('./npm-view');

module.exports = function(name, opts={}){

    if ( !name ) {
        opts.error && opts.error('');
        return false;
    }

    let pkg = npmView(name);
    if ( !pkg ) {
        return false;
    }

    let sCmd = 'npm install ' + pkg
	console.log('$> ' + sCmd);

    let rs = execa.shellSync(sCmd);
    return !rs.code;
};
