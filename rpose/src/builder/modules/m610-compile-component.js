const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// 单纯的自身组件编译，不顾引用的组件是否有效
module.exports = bus.on('编译组件', function(fnTmpl){

	return async function(file, restart=false){
		try{
			let env = bus.at('编译环境');
			if ( !fnTmpl ) {
				fnTmpl = await bus.at('编译模板JS');
			}
			if ( file.endsWith('.rpose') ) {
				let btf = await bus.at('编译源文件', file, restart);
				let doc = btf.getDocument();
                doc.imagepath = bus.at('页面图片相对路径', file);
				doc.js = fnTmpl(doc);
                replaceCssClassName(doc);
let to = env.path.build_temp + '/' + bus.at('默认标签名', file) + '.js';		// 假定组件都编译到%build_temp%目录
!env.release && await File.writePromise(to, await require('@gotoeasy/csjs').formatJs(doc.js));
				return btf;
			}else if ( file.indexOf(':') < 0 ) {
				let srcFile = bus.at('标签源文件', file);
				if ( !File.exists(srcFile) ) {
					throw new Err('component file not found (tag = ' + file + ')');
				}
				let btf = await bus.at('编译源文件', srcFile, restart);
				let doc = btf.getDocument();
                doc.imagepath = bus.at('页面图片相对路径', srcFile);
				doc.js = fnTmpl(doc);
                replaceCssClassName(doc);
let to = env.path.build_temp + '/' + bus.at('默认标签名', srcFile) + '.js';		// 假定组件都编译到%build_temp%目录
!env.release && await File.writePromise(to, await require('@gotoeasy/csjs').formatJs(doc.js));
				return btf;
			}else{
				// TODO npm package
				throw new Err('TODO npm pkg');
			}

		}catch(e){
			// console.info(MODULE, '------------------------', file)
			throw Err.cat(MODULE + 'compile component failed', file, e);
		}
	};

}());

function replaceCssClassName(doc){
    let oMapping = doc.mapping;
    // TODO 通过AST修改
    if ( oMapping ) {
        let js = doc.js;
        for ( let k in oMapping ) {
            js = js.replace(new RegExp(`\\$\\$\\(("|')\\.?${k}("|')\\)`, 'ig'), `$$$('.${oMapping[k]}')`);              // 类名哈希化， $$('.my-class') -> $$('.xxxxxxxx')
            js = js.replace(new RegExp(`\\.addClass\\(("|')${k}("|')\\)`, 'ig'), `.addClass('${oMapping[k]}')`);        // 类名哈希化， .addClass('my-class') -> .addClass('xxxxxxxx')
            js = js.replace(new RegExp(`\\.removeClass\\(("|')${k}("|')\\)`, 'ig'), `.removeClass('${oMapping[k]}')`);  // 类名哈希化， .removeClass('my-class') -> .removeClass('xxxxxxxx')
        }
        doc.js = js;
    }
}