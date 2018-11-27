
// 用户目录
function homedir() {
	const os = require('os');

	if ( typeof os.homedir === 'function'  ) {
		return os.homedir().replace(/\\/g, '/');
	}

	let rs;
	let env = process.env;
	let home = env.HOME;
	let user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;

	if (process.platform === 'win32') {
		rs = env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home || '';
	}else if (process.platform === 'darwin') {
		rs = home || (user ? '/Users/' + user : '');
	}else if (process.platform === 'linux') {
		rs = home || (process.getuid() === 0 ? '/root' : (user ? '/home/' + user : ''));
	}else{
		rs = home || '';
	}

	return rs.replace(/\\/g, '/');
}


module.exports = (function(dir){

	return function(){
		return dir ? dir : (dir = homedir());
	};

})();

