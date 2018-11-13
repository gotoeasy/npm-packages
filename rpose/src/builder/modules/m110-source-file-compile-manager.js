const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('编译管理', function(){

	let todoCompSet = new Set(); // 待编译成组件的文件
	let todoPageSet = new Set(); // 待编译成页面的文件

	let result = {
		btfs: {}, // btf文件名： btf对象
		tags: [], // 所有tag
		pageTags: {}, // 页面btf文件： 页面tag
		tagRequires: {}, // 组件tag： 直接依赖的组件(set)
		tagRequireAll: {}, // 页面tag： 依赖的所有组件(ary)
		srcTags: {}, // btf文件名： 该btf文件定义的所有tag
		components: {}, // 组件tag： {js:源码，css:源码}
		pages: {}, // 页面tag： {js:源码，css:源码}
		ready: false // 文件监听就绪
	};

	bus.on('源文件清单', initFileList);

	bus.on('添加源文件', compileFile);
	bus.on('修改源文件', compileFile);

	bus.on('删除源文件', function(file){
		todoCompSet.delete(file);
		delete result.pageTags[file]; // 删除页面tag

		delete result.btfs[file];
	});

	console.debug(MODULE, 'init source file event');



	return function(){
		return result;
	};


	function initFileList(files){
		files.forEach( f => todoCompSet.add(f) );
	}

	async function compileFile(file){
		todoCompSet.add(file); // 该文件的组件编译中

		let env = bus.at('编译环境');
		result.btfs[file] = await bus.at('源文件解析', file);

		if ( file.startsWith(env.path.src_pages) ) {
			// 目录 %env.path.src_pages% 中的是页面
			let pageTag = file.substring(file.lastIndexOf('/')+1).split('.')[0].toLowerCase();
			todoPageSet.add(pageTag); // 该页面标签待编译
			result.pageTags[file] = pageTag;
		}

		let tags = await bus.at('源文件标签', file, result.btfs[file]);
		tags.forEach(v => !result.tags.includes(v) && result.tags.push(v));
		result.srcTags[file] = tags;
		console.debug(MODULE, 'file parse finish:', file);

		bus.at('组件编译', file, result.btfs[file], result.components);
		console.debug(MODULE, 'compile component finish:', file);

		if ( env.publish ) {
			bus.at('组件代码美化', tags, result.components);
			bus.at('组件代码输出', tags, result.components);
		}

		todoCompSet.delete(file); // 该文件的组件编译完

		// TODO 优化编译性能
		let	ready = !todoCompSet.size; // 组件编译就绪
		console.debug(MODULE, 'component ready:', ready);
		if ( ready ) {
			bus.at('组件汇总输出', result);

			bus.at('页面引用组件', false); // 重新查找

			console.info(MODULE, 'write page ......');
			todoPageSet.forEach(pageTag => {
				bus.at('页面编译', pageTag, result.components, result.pages);
				bus.at('页面代码输出', pageTag, result.pages);
			});
			todoPageSet.clear();

			bus.at('复制包文件');

			console.info();
		}

	}

}());

