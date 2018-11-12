const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

/**
* 组件汇总单一文件，仅为开发方便，打包发布应优化
*/
module.exports = bus.on('组件汇总输出', function(){

	return function(result, tags){

		let env = bus.at('编译环境');
		if ( !env.outComponents ) {
			return; // 除非指定，否则不输出组件代码
		}

		!tags && (tags = result.tags);
		tags.sort();

		console.debug(MODULE, 'component-all-in-one');

		writeAllInOneJs(tags, result.components);
		writeAllInOneCss(tags, result.components);

	};

}());

function writeAllInOneJs(tags, components){
	let env = bus.at('编译环境');

	let ary = [];
	// 组件汇总合并
	ary.push('(function($$, escapeHtml){');
	ary.push('// 组件注册');
	ary.push('rpose.registerComponents.....'); // 占位留用，将覆盖
	ary.push('');
	tags.forEach(tag => ary.push(components[tag].js));
	ary.push('})(rpose.$$, rpose.escapeHtml);');

	let obj = {};
	tags.forEach(tag => obj["'" + tag + "'"] = getComponentName(tag));
	ary[2] = 'rpose.registerComponents(' + JSON.stringify(obj).replace(/"/g,'') + ');\r\n';

	// 删除掉组件挂载的代码(TODO：用正则替换删除)
	let src = ary.join('\r\n');
	let iStart,iEnd;
	while ( (iStart = src.indexOf('// 组件挂载\r\n')) > 0 ) {
		iEnd = src.indexOf(');\r\n', iStart);
		src = src.replace(src.substring(iStart, iEnd + 4), '');
	}

	// 代码格式化
	let text = csjs.formatJs(src);

	// 写文件
	let file = env.path.build_temp_csjs + '/components.js';
	File.write(file, text);

//	// TODO 压缩、转换
//	file = env.path.build_dist_csjs + '/components.js';
//	File.write(file, text);
//	console.debug(MODULE, 'write file:', file);
}


function writeAllInOneCss(tags, components){
	let env = bus.at('编译环境');

	let ary = [];

	// 组件汇总合并
	tags.forEach(tag => ary.push(components[tag].css));

	// 代码格式化
	let text = csjs.formatCss(ary.join('\r\n'));

	// 写文件
	let file = env.path.build_temp_csjs + '/components.css';
	File.write(file, text);

//	// 压缩转换css复制图片
//	csjs.cssUrl(file, env.path.build_dist_csjs + '/components.css');
//	console.debug(MODULE, 'write file:', file);
}

function getComponentName(tag){
	return tag.indexOf('-') < 0 ? tag : tag.split('-').map( s => s.substring(0,1).toUpperCase()+s.substring(1) ).join(''); // abc-def -> AbcDef
}
