const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

/**
* 页面依赖组件汇总CSS
*/
module.exports = bus.on('页面依赖组件汇总CSS', function(){

	return function(pageTag){

		const manager = bus.at('编译管理');
		const components = manager.components;  // 组件tag： {js:源码，css:源码}
		const tagRequireAll = manager.tagRequireAll;  // 组件tag： 组件依赖的所有组件tag(ary)


		console.debug(MODULE, 'page-component-css');
		let tags = tagRequireAll[pageTag]; // 汇总页面JS时已计算好，直接使用

		let src = [];
		tags.forEach(tag => src.push(components[tag].css));

		return src.join('\r\n');
	};

}());

 