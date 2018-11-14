const File = require('@gotoeasy/file');
const os = require('os');
const osLocale = require('os-locale');

// 用户目录
function homedir() {
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

// 文件缓存locale名
function locale() {
	let cacheFile = homedir() + '/.temp/@gotoeasy/os/locale.txt'
	if ( File.exists(cacheFile) ) {
		return File.read(cacheFile);
	}

	let locale = osLocale.sync();
	File.write(cacheFile, locale);
	return locale;
}



let api = {};
api.homedir = homedir();
api.locale = locale();


module.exports = api;
