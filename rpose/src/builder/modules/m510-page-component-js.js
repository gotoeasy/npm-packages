const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

/**
* 页面依赖组件汇总JS
*/
module.exports = bus.on('页面依赖组件汇总JS', function(){

	return function(pageTag){

		const manager = bus.at('编译管理');
		const components = manager.components;  // 组件tag： {js:源码，css:源码}
		const tagRequireAll = manager.tagRequireAll;  // 组件tag： 组件依赖的所有组件tag(ary)
		const env = bus.at('编译环境');

		let pageComponents = {};
		let tags = tagRequireAll[pageTag];
		tags.push(pageTag); // 页面放最后
		tags.forEach(t => pageComponents[t] = components[t]);

		console.debug(MODULE, 'page-component-js');

//console.info(MODULE, pageTag, '--------',  tags);
		return pageComponentsJs(tags, pageComponents, env);

	};

}());

function pageComponentsJs(tags, components, env){

	let ary = [];
	// 组件汇总合并
	ary.push('(function($$, escapeHtml){');
	ary.push('// 组件注册');
	ary.push('rpose.registerComponents.....'); // 占位留用，将覆盖
	ary.push('');

	tags.forEach(tag =>{
		if ( !components[tag] ) {
			throw new Error('component not found: ' + tag);
		}
		ary.push(components[tag].js)
	});
	ary.push('})(rpose.$$, rpose.escapeHtml);');

	let obj = {};
	tags.forEach(tag => obj["'" + tag + "'"] = getComponentName(tag));
	ary[2] = 'rpose.registerComponents(' + JSON.stringify(obj).replace(/"/g,'') + ');\r\n';

	let src = ary.join('\r\n');

//	// 删除掉组件挂载的代码(TODO：用正则替换删除)
//	let src = ary.join('\r\n');
//	let iStart,iEnd;
//	while ( (iStart = src.indexOf('// 组件挂载\r\n')) > 0 ) {
//		iEnd = src.indexOf(');\r\n', iStart);
//		src = src.replace(src.substring(iStart, iEnd + 4), '');
//	}

	// 代码格式化
	return csjs.formatJs(src);
}

function getComponentName(tag){
	return tag.indexOf('-') < 0 ? tag : tag.split('-').map( s => s.substring(0,1).toUpperCase()+s.substring(1) ).join(''); // abc-def -> AbcDef
}
