const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const fs = require('fs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('输出页面JS文件', function(){

	// 异步输出页面JS文件
	return async function(btfFile, allrequires){

		let jsFile = bus.at('页面目标JS文件名', btfFile);
		let source;

		try{
			source = await bus.at('汇总页面关联JS代码', btfFile, allrequires);
		}catch(e){
			console.error(MODULE, 'concat page js failed', jsFile);
			throw e;
		}

		try{
			await File.writePromise(jsFile, source);
		}catch(e){
			console.error(MODULE, 'write page js failed', jsFile);
			throw e;
		}
	}; 


}());
