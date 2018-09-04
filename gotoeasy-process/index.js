const child_process = require('child_process')
const iconv = require('iconv-lite');
const osLocale = require('os-locale');

const LOCALE = osLocale.sync();
const ENCODING = LOCALE == 'zh_CN' ? 'cp936' : (LOCALE == 'ja_JP'? 'ms932' : null);


// 异步执行
function exec(command
	, options = { encoding:'binary' }
	, callback = (err, stdout, stderr) =>	{
												if (err) {
													console.log( ENCODING ? iconv.decode(new Buffer(stderr, 'binary'), ENCODING) : stderr );
													console.log('------------------------------------------------------');
													console.log('Execute command failed:');
													console.log(command);
													console.log('------------------------------------------------------');
												}else{
													console.log( ENCODING ? iconv.decode(new Buffer(stdout, 'binary'), ENCODING) : stdout );
												}
											}
	) {
	return (typeof options == 'function') ?
			child_process.exec(command, { encoding:'binary' },  options) :
			child_process.exec(command, options,  callback);
}

// 同步执行
function execSync(command, options = { timeout: 10*60*1000 } ) {
	return child_process.execSync(command, options);
}


// 导出接口
let api = {};
api.exec = exec;
api.execSync = execSync;

module.exports = api;
