const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

// Error
Error.err = function(...args){
	return new Error(args.join('\n    '));
}


bus.on('是否页面源文件', function(){

	// 判断是否页面源文件
	return function(btfFile){
		let env = bus.at('编译环境');
		return !btfFile.startsWith(env.path.src_components); // 非组件目录就按页面看待
	}

}());





bus.on('组件目标JS文件名', function(){

	return function(btfFile){
		let env = bus.at('编译环境');
		return env.path.build_temp + btfFile.substring(env.path.src_btf.length, btfFile.length-4) + '.js'; 
	};

}());

bus.on('组件目标CSS文件名', function(){

	return function(btfFile){
		let env = bus.at('编译环境');
		return env.path.build_temp + btfFile.substring(env.path.src_btf.length, btfFile.length-4) + '.css'; 
	};

}());

bus.on('页面目标JS文件名', function(){

	return function(btfFile){
		let env = bus.at('编译环境');
		return env.path.build_dist + btfFile.substring(env.path.src_btf.length, btfFile.length-4) + '.js'; 
	};

}());

bus.on('页面目标CSS文件名', function(){

	return function(btfFile){
		let env = bus.at('编译环境');
		return env.path.build_dist + btfFile.substring(env.path.src_btf.length, btfFile.length-4) + '.css'; 
	};

}());

bus.on('页面目标HTML文件名', function(){

	return function(btfFile){
		let env = bus.at('编译环境');
		return env.path.build_dist + btfFile.substring(env.path.src_btf.length, btfFile.length-4) + '.html'; 
	};

}());


bus.on('默认标签名', function(){

	return btfFile => {
		let tag = btfFile.substring(btfFile.lastIndexOf('/')+1).split('.')[0].toLowerCase();
		tag = tag.replace(/\s+/g, '');
		return tag;
	}

}());

bus.on('标签源文件', function(){

	return tag => {
		let files = bus.at('源文件清单');
		let name = '/' + tag + '.btf';
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
		state ? console.info(MODULE, 'page ok:', htmlFile) : console.info(MODULE, 'page ng:', htmlFile);;
	}

}());


