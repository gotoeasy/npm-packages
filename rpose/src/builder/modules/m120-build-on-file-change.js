const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('重新编译被更新源文件', function(){

	return async function(btfFile){
		let env = bus.at('编译环境');

console.time('build')

		let files = bus.at('源文件清单', btfFile);
		let isPage = bus.at('是否页面源文件', btfFile);
		
		let cplErr, btf, tag = bus.at('默认标签名', btfFile);

		// 先同步编译，方便查找编译错误
		try{
			//btf = await bus.at('编译组件', btfFile, true);			// 重新解析编译
			bus.at('编译组件', btfFile, true);			// 重新解析编译
		}catch(e){
			//cplErr = Err.cat(MODULE + 'compile failed on file change', btfFile, e);
		}

		// ----------------------------------------------------
		// 页面文件更新时，需要输出页面文件
		// ----------------------------------------------------
		try{
			if ( isPage ) {
				await bus.at('输出页面代码文件', btfFile);
			}
		}catch(e){
			let err = Err.cat(MODULE + 'build page failed on change', btfFile, e, cplErr);
			bus.at('删除已生成的页面代码文件', btfFile, err);
			throw err;
		}

		let err;
		// ----------------------------------------------------
		// TODO 重新编译关联的组件（某关联组件如果没有被页面使用，可能导致漏编译）
		// ----------------------------------------------------

		// ----------------------------------------------------
		// 检查有没有被其他页面使用，有的话更新输出关联页面
		// ----------------------------------------------------
		for ( let i=0,file,allrequires; file=files[i++]; ) {
			if ( !bus.at('是否页面源文件', file) || file == btfFile ) {
				continue; // 非页面或是页面自己时都不用处理
			}

			try{
				allrequires = await bus.at('查找页面依赖组件', file);
			}catch(e){
				try{
					allrequires = await bus.at('查找页面依赖组件', file, true);	// 原来就编译失败，尝试重新编译查找
				}catch(e){
					err = Err.cat(new Err('build page failed on change'), e);
					continue;
				}
			}

			if ( allrequires.includes(tag) && allrequires.length > 1 ) {
				try{
					await bus.at('查找页面依赖组件', file, true);				// 异步任务重新查找页面依赖组件
					await bus.at('输出页面代码文件', file);
				}catch(e){
					err = Err.cat(new Err('build page failed on change'), e);
					bus.at('删除已生成的页面代码文件', file, err);
				}
			}
		}

		if ( err ) {
			throw err;
		}



console.timeEnd('build')

	};


}());

