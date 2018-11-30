const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');


const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// 源代码删除时触发
module.exports = bus.on('删除已生成的页面代码文件', function(){

	return function(btfFile, err){

		let jsFile = bus.at('页面目标JS文件名', btfFile);
		let cssFile = bus.at('页面目标CSS文件名', btfFile);
		let htmlFile = bus.at('页面目标HTML文件名', btfFile);

		File.remove(jsFile);
		File.remove(cssFile);
		if ( err ) {
			File.exists(htmlFile) && File.write(htmlFile, syncHtml(err)); // 文件存在时替换文件内容，以同步浏览器提示信息
		}else{
			File.remove(htmlFile);
		}

	}; 


}());

// 在watch模式下，编译失败或删除页面文件时，生成的html文件不删除，便于浏览器同步提示信息
function syncHtml(e){

	let env = bus.at('编译环境');
	if ( env.mode != 'watch' ) {
		return;
	}

	return `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body>Page build failed or src file removed<p><pre>${e}</pre></body>`;
}