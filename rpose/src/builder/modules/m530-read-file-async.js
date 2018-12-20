const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const PTask = require('@gotoeasy/p-task');
const File = require('@gotoeasy/file');
const hash = require('string-hash');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('异步读文件', function(map=new Map){

	return function (btfFile, restart=false) {
		if ( !restart && map.has(btfFile) ) {
			return map.get(btfFile);
		}

		if ( !File.exists(btfFile) ) {
			map.delete(btfFile);
			return undefined;                      // 文件不存在时返回undefined！！！
		}

		let pTxt = File.readPromise(btfFile);
		map.set(btfFile, pTxt);
		
		let env = bus.at('编译环境');
		env.mode == 'watch' && setTimeout(x=>map.delete(btfFile), 3 * 60 * 1000 ); // 缓存3分钟
		
		return pTxt;
	};

}());

