const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('源文件删除时再编译', function(){

	return async function(btfFile){
		let env = bus.at('编译环境');
console.time('build')

		try{
			let btf = await bus.at('解析源文件', btfFile);		// 缓存的原解析结果
			let tagpkg = btf.getText('tagpkg');					// 原标签全名

			let files = bus.at('源文件清单', btfFile, false);	// 源文件清单中删除该文件
			bus.at('异步读文件', btfFile, true);					// 重读文件（删缓存）
		
			if ( bus.at('是否页面源文件', btfFile) ) {
				bus.at('删除已生成的页面代码文件', btfFile);
			}

			// ----------------------------------------------------
			// TODO 重新编译关联的组件（某关联组件如果没有被页面使用，可能导致漏编译）
			// ----------------------------------------------------

			// ----------------------------------------------------
			// 检查有没有被其他页面使用，有的话更新输出关联页面
			// ----------------------------------------------------
			let writePages = [];
			for ( let i=0,file,allrequires; file=files[i++]; ) {
				if ( !bus.at('是否页面源文件', file) ) {
					continue;
				}

				try{
					allrequires = await bus.at('查找页面依赖组件', file);
				}catch(e){
					try{
						allrequires = await bus.at('查找页面依赖组件', file, true);	// 原来就编译失败，尝试重新编译查找
						writePages.push( bus.at('输出页面代码文件', file) );			// 直接尝试重新编译输出
					}catch(e){
						errs.push( Err.cat(MODULE + 'compile page failed', file, e) );
						continue;
					}
				}

				if ( allrequires.includes(tagpkg) ) {
					bus.at('查找页面依赖组件', file, true);							// 异步任务重新查找页面依赖组件
					writePages.push( bus.at('输出页面代码文件', file) );
				}
			}

			await Promise.all(writePages);
		}catch(e){
			throw Err.cat(MODULE + 'build failed on file remove', btfFile, e);
		}
console.timeEnd('build')

	};


}());

