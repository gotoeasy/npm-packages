const bus = require('@gotoeasy/bus');


const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('输出页面代码文件', function(){

	return async function(btfFile){
	
		try{
			let allrequires = await bus.at('查找页面依赖组件', btfFile);
//console.error(MODULE, '------------allrequires------------', btfFile, allrequires);
			await Promise.all( [bus.at('输出页面JS文件', btfFile, allrequires), bus.at('输出页面CSS文件', btfFile, allrequires)]  );
			await bus.at('输出页面HTML文件', btfFile);

			//bus.at('页面编译状态', btfFile, true);
		}catch(e){
			bus.at('页面编译状态', btfFile, false);
			console.error(MODULE, 'write page ng', btfFile, e);
			throw e;
		}

	}; 


}());

