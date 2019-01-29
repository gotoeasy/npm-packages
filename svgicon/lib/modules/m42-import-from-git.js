const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const os = require('@gotoeasy/os');
const gitpullorclone = require('git-pull-or-clone');

module.exports = bus.on('import-from-git', function(){

    // 从git地址导入svf图标文件
	return (url) => {

        let pathTmp = File.resolve('', './temp' + new Date().getTime() );

        gitpullorclone(url, pathTmp, async e => {
			if ( e ) {
				console.debug('download NG ......', url);
				console.error(e);
			}else{
				console.debug('download OK ......', url);
                await bus.at('svgicons-normalize-to-svg-data', pathTmp);
                File.remove(pathTmp);
            }
		});
    };

}());

