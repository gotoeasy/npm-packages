const File = require('@gotoeasy/file');
const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');
const fs = require('fs');

const npmrc = require('./npmrc')();

// HTTP/HTTPS proxy to connect to
const proxy = process.env.http_proxy || npmrc.proxy || '';
const agent = new HttpsProxyAgent(proxy);

const tmpdir = require('./homedir')() + '/.temp';
File.mkdir(tmpdir, true);

// url： 下载地址，不支持重定向
// dist: 指定时保存为该路径文件名，未指定时使用临时目录随机文件名
function download(url, dist){

	let options = require('url').parse(url);
	options.agent = agent;

	return new Promise(function(resolve, reject){

		https.get(options, function (res) {
			if ( res.headers.vary ) {
				// OK
				let okFile = dist || tmpdir + '/' + (new Date()-0) + '.download';
				File.mkdir(okFile.substring(0, okFile.lastIndexOf('/'))); // 建目录
				res.pipe(fs.createWriteStream(okFile))
					.on('finish', function(){
						resolve({file:okFile});
					});
			}else{
				// NG
				let ngFile = tmpdir + '/error-' + (new Date()-0) + '.txt';
				res.pipe(fs.createWriteStream(ngFile))
					.on('finish', function(){
						let txt = File.read(ngFile);
						setTimeout(function(){
							File.remove(ngFile);
						}, 10000);
						resolve({error: txt});
					});
			}
		});

	})


}


module.exports = download;

