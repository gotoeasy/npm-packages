const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('重新编译被更新源文件', function(){

	return async function(btfFile){
		let env = bus.at('编译环境');

/*		try{
			await bus.at('初始化源文件标签映射关系');
		}catch(e){
			return console.error(MODULE, e);
		}
*/		

	//	let files = bus.at('源文件清单');
	//	let pages = [];

console.time('build changed file (' + btfFile + ')')

		try{
			await bus.at('编译组件', btfFile, true);
		}catch(e){
			console.error(MODULE, e);
			throw e;
		}
		
		if ( bus.at('是否页面源文件', btfFile) ) {
			await bus.at('输出页面代码文件', btfFile);
		}else{
			// TODO 关联页面
		}

console.timeEnd('build changed file (' + btfFile + ')')

	};


}());

