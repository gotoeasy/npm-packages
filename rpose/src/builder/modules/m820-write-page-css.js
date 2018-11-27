const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const fs = require('fs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('输出页面CSS文件', function(){

	// 异步输出页面CSS文件
	return async function(btfFile, allrequires){

		let cssFile = bus.at('页面目标CSS文件名', btfFile);
		let source;

		try{
			source = await bus.at('汇总页面关联CSS代码', btfFile, allrequires);
		}catch(e){
			console.error(MODULE, 'concat page css failed', cssFile);
			throw e;
		}

		try{
			await File.writePromise(cssFile, source);
		}catch(e){
			console.error(MODULE, 'write page css failed', e);
			throw e;
		}

	};


}());
