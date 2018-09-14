const os = require('os');

function homedir() {
	var env = process.env;
	var home = env.HOME;
	var user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;

	if (process.platform === 'win32') {
		return env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home || '';
	}

	if (process.platform === 'darwin') {
		return home || (user ? '/Users/' + user : '');
	}

	if (process.platform === 'linux') {
		return home || (process.getuid() === 0 ? '/root' : (user ? '/home/' + user : ''));
	}

	return home || '';
}

module.exports = function (){
	let fn = typeof os.homedir === 'function' ? os.homedir : homedir;
	return fn().replace(/\\/g, '/')
}
