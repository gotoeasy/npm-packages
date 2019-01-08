const syncExec = require('sync-exec');

module.exports = function(name){

    if ( !name ) return;

    let sCmd = 'npm uninstall ' + name
	console.log('execute command: ' + sCmd);
	let rs = syncExec(sCmd);
	if ( rs.stderr ) {
		console.error( rs.stderr );
	}else{
		console.log( rs.stdout );
	}

};
