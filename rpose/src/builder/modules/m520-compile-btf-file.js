const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const Err = require('@gotoeasy/err');
const compiler = require('../../compiler/compiler');
const acorn = require('acorn');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// TODO 重复编译CSS
module.exports = bus.on('编译源文件', function(){

	return async function (file) {
        
        let cache = bus.at('缓存', 'compile-btf');      // 指定名的缓存对象
        let oResult = cache.get(file);
        let oSrc = bus.at('源文件内容', file);
        if ( oResult && oResult.hashcode === oSrc.hashcode ) {     // TODO 考虑配置因素
            return oResult;
        }

		try{
			if ( file.endsWith('.rpose') ) {
                let oParse = bus.at('解析源文件', file);
                oResult = Object.assign( await parseBtfoParseument(oParse, file), {hashcode: oSrc.hashcode} );

                cache.put(file, oResult);
				return oResult;
			}

            let srcFile = bus.at('标签源文件', file);
            if ( !File.exists(srcFile) ) {
                throw new Err('component not found (tag = ' + file + ')');
            }

            let oParse = bus.at('解析源文件', file);
            oResult = Object.assign( await parseBtfoParseument(oParse, file), {hashcode: oSrc.hashcode} );

            cache.put(file, oResult);
            return oResult;
		}catch(e){
			throw Err.cat(MODULE + 'src compile failed', e);
		}
	};

}());


async function parseBtfoParseument(oParse, file){

	let theme = bus.at('样式风格');

	// CSS先于JS编译，JS编译会使用CSS类名修改前后的映射表
	let hasCss = !!oParse.css;
    let css = oParse.css, oResult = Object.assign({}, oParse);

	try{
		// CSS预处理-LESS
		oParse.less && (css += '\n' + await bus.at('编译LESS', theme.themeLess + oParse.less, file));
	}catch(e){
		throw Err.cat(MODULE + 'less compile failed', e);
	}

	try{
		// CSS预处理-SCSS
		oParse.scss && (css += '\n' + await bus.at('编译SCSS', theme.themeSass + oParse.scss, file));
	}catch(e){
		throw Err.cat(MODULE + 'sass compile failed', e);
	}

	// TODO ..... 对应JS中的CSS类名修改
//console.info('-------------------css--111------------------', css)

	// 注意块名为小写，编辑后的数据对象将作为模板数据对象直接传给代码模板
	oResult.$fnTemplate	= await compiler(oParse);						// 模板函数源码，html为模板，state、options、methods等用于检查模板变量
	oResult.requires = oParse.requires || [];								// 编译后设定直接依赖的组件标签全名数组
	oResult.cssclasses = oParse.cssclasses || [];						// 如['btn@pkgname']

//console.info('-----------------cssclasses------------------', oResult.cssclasses)

    let oCss = {};
    for ( let i=0,classpkg,ary; classpkg=oResult.cssclasses[i++]; ) {
        let tmps = classpkg.split('@');
        if ( tmps.length === 2 ) {
            ary = oCss[tmps[1]] = oCss[tmps[1]] || [];
            !ary.includes(tmps[0]) && ary.push(tmps[0]);
        }
    }

    let pkgs = Object.keys(oCss);
    for ( let i=0,pkg,ary; pkg=pkgs[i++]; ) {
        ary = oCss[pkg];
//console.info('-------------------req ary------------------', pkg, ary)
        css += '\n' + await bus.at('样式库引用', pkg, ...ary);         // 按需引用样式
    }

	// CSS后处理
	if ( css ) {
		let rs = await bus.at('编译组件CSS', (hasCss ? theme.themeCss : '') + css, file);
		oResult.css = rs.css;
		oResult.mapping = rs.mapping; // 样式类名修改前后映射表
	}

	// statekeys的$SLOT可在编译期判断得知，所以程序可以省略不写
	if ( oResult.$fnTemplate.indexOf('.$SLOT ') > 0 ) {
		if ( oParse.statekeys == null ) {
			oParse.statekeys = ["$SLOT"];
            oResult.statekeys = ["$SLOT"];
		}else{
			!oParse.statekeys.includes('$SLOT') && oParse.statekeys.push('$SLOT');
            oResult.statekeys = oParse.statekeys;
		}
	}

	return oResult;
}

