const execa = require('execa');

module.exports = function(name){

    if ( !name ) return;

    let sCmd = 'npm uninstall ' + name
	console.log('$> ' + sCmd);
    let rs = execa.shellSync(sCmd);
	if ( rs.stderr ) {
		console.error( rs.stderr );
	}else{
		console.log( rs.stdout );
	}

};
