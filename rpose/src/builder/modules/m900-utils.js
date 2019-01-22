const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');
const hash = require('@gotoeasy/hash');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';


bus.on('是否页面源文件', function(){

	// 判断是否页面源文件
	return function(srcFile){
		let env = bus.at('编译环境');
		return !/\/components\//i.test(srcFile) && !srcFile.startsWith(env.path.src_buildin); // 目录不含components且不是buildin目录就按页面看待
	}

}());





bus.on('组件目标JS文件名', function(){

	return function(srcFile){
		let env = bus.at('编译环境');
		if ( srcFile.startsWith(env.path.src_buildin) ) {
			return srcFile.substring(0, srcFile.length-6) + '.js';  // buildin
		}
		return env.path.build_temp + srcFile.substring(env.path.src.length, srcFile.length-6) + '.js'; 
	};

}());

bus.on('组件目标CSS文件名', function(){

	return function(srcFile){
		let env = bus.at('编译环境');
		if ( srcFile.startsWith(env.path.src_buildin) ) {
			return srcFile.substring(0, srcFile.length-6) + '.css';  // buildin
		}
		return env.path.build_temp + srcFile.substring(env.path.src.length, srcFile.length-6) + '.css'; 
	};

}());

bus.on('页面目标JS文件名', function(){

	return function(srcFile){
		let env = bus.at('编译环境');
		return env.path.build_dist + srcFile.substring(env.path.src.length, srcFile.length-6) + '.js'; 
	};

}());

bus.on('页面目标CSS文件名', function(){

	return function(srcFile){
		let env = bus.at('编译环境');
		return env.path.build_dist + srcFile.substring(env.path.src.length, srcFile.length-6) + '.css'; 
	};

}());

bus.on('页面目标HTML文件名', function(){

	return function(srcFile){
		let env = bus.at('编译环境');
		return env.path.build_dist + srcFile.substring(env.path.src.length, srcFile.length-6) + '.html'; 
	};

}());


bus.on('默认标签名', function(){

	return srcFile => {
		let env = bus.at('编译环境');
		if ( srcFile.startsWith(env.path.src_buildin) ) {
			return require('path').parse(srcFile).name;  // buildin 返回文件名（不含路径及扩展名）
		}
		let tag = srcFile.substring(srcFile.lastIndexOf('/')+1).split('.')[0].toLowerCase();
		tag = tag.replace(/\s+/g, '');
		return tag;
	}

}());

bus.on('标签源文件', function(){

	return tag => {
        if ( tag.endsWith('.rpose') ) {
            return tag; // 已经是文件
        }

		let files = bus.at('源文件清单');
		let name = '/' + tag + '.rpose';
		for ( let i=0,file; file=files[i++]; ) {
			if ( file.endsWith(name) ) {
				return file;
			}
		}
	};

}());

bus.on('标签全名', function(){

	return (tag, pkg) => {
		return pkg ? (tag + ':' + pkg) : tag;
	};

}());


bus.on('组件类名', function(){

	return (tag, pkg='') => {

		if ( tag === '```' ) {
			return '$BuildIn$_' + hash(tag);  // buildin 特殊处理
		}

		// ui-tag
		// ui-tag:def-gh.xyz@1.2.3
		// ui-tag:@abc/def-gh.xyz@1.2.3
		let tagpkg = bus.at('标签全名', tag, pkg);

		let ary = tagpkg.split(':');
		let sTag = ('-' + ary[0]).split('-').map( s => s.substring(0,1).toUpperCase()+s.substring(1) ).join(''); // abc-def => AbcDef
		if ( tagpkg.indexOf(':') < 0 ) {
			// (ui-tag) => UiTag
			return sTag;
		}


		let sPkg = ary[1].replace(/@/g, '$').replace(/\//g, '_-').replace(/\./g, '_');
		sPkg && ( sPkg = ('-'+sPkg).split('-').map( s => s.substring(0,1).toUpperCase()+s.substring(1) ).join('') ); // @abc/def-gh.xyz@1.2.3 => $abc_DefGh_xyz$1_2_3
		// (ui-tag, abc-def@0.1.2) => UiTag__AbcDef$0_1_2
		// (ui-tag, @abc/def-gh.xyz@1.2.3) => UiTag__$abc_DefGh_xyz$1_2_3
		return sTag + '__' + sPkg;
	}

}());



bus.on('页面编译状态', function(){

	return function(htmlFile, state){
		state ? console.info(MODULE, 'ok:', htmlFile) : console.info(MODULE, 'ng:', htmlFile);;
	}

}());


bus.on('页面图片相对路径', function(){

	return (srcFile) => {
		let env = bus.at('编译环境');
        
        let pathLen = srcFile.startsWith(env.path.src) ? env.path.src.length : env.path.src_buildin.length;
        let ary = srcFile.substring(pathLen).split('/');
        return '../'.repeat(ary.length-2) + 'images/';
	};

}());



bus.on('页面哈希', function(){

	return (file, allrequires) => {
        let cache = bus.at('缓存', 'page');      // 指定名的缓存对象

        if ( allrequires === undefined ) {
            // 读取缓存
            let oPage = cache.get(file);
            return oPage ? oPage.hashs : undefined;
        }else{
            // 保存缓存
            let oComp = bus.at('编译组件', file);
            let hashs = bus.at('计算页面哈希', file, oComp.allrequires);
            cache.put(file, {hashs});
            return hashs;
        }
	};

}());

bus.on('计算页面哈希', function(){

	return (file, allrequires) => {

        // 页面关联的全部组件文件，去除重复后排序
        let fileSet = new Set();
        fileSet.add(file);
        allrequires.forEach(tag => fileSet.add( bus.at('标签源文件', tag) ));
        let files = [...fileSet];
        files.sort();

        // 取出文件hashcode存入数组
        let ary = [];
        files.forEach(f => ary.push( (bus.at('源文件内容', f) || {hashcode: f}).hashcode ) );

        // 计算数组hashcode返回
        return hash(ary.join('\r\n'));
	};

}());
