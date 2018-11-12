const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('页面编译', function(){

	return function(pageTag, components, pages){

		let env = bus.at('编译环境');
		const manager = bus.at('编译管理');
		const oRef = manager.tagRequires;	// 本组件所直接依赖的其他组件（set）

		let obj = {};
		let srcJs = [];
		let srcCss = [];
		srcJs.push('(function(rpose, $$, escapeHtml){');

		// 页面上的相关组件注册，仅release才做
		if ( env.release ) {
			srcJs.push('// 组件注册');
			srcJs.push('');
			oRef[pageTag].forEach(tag => {
				obj["'" + tag + "'"] = getComponentName(tag);
				srcJs.push( components[tag].js );

				srcCss.push( components[tag].css );
			});
		}

		srcJs.push( components[pageTag].js );
		srcJs.push('})(rpose, rpose.$$, rpose.escapeHtml);');

		// 页面上的相关组件注册，仅release才做
		if ( env.release ) {
			srcJs[2] = 'rpose.registerComponents(' + JSON.stringify(obj).replace(/"/g,'') + ');\r\n';
		}

		srcCss.push( components[pageTag].css );

		pages[pageTag] = {
			js: csjs.formatJs( srcJs.join('\r\n') ),
			css: csjs.formatCss( srcCss.join('\r\n') )
		};
		console.debug(MODULE, pageTag);

	};

}());

function getComponentName(tag){
	return tag.indexOf('-') < 0 ? tag : tag.split('-').map( s => s.substring(0,1).toUpperCase()+s.substring(1) ).join(''); // abc-def -> AbcDef
}















/*
module.exports = event.on('页面编译', function(){

	return function(pageTags, components, pages){

		let env = event.at('编译环境');
		const oRef = event.at('页面引用组件');

		for ( let file in pageTags ) {
			let pageTag = pageTags[file];

			let obj = {};
			let srcJs = [];
			let srcCss = [];
			srcJs.push('(function(rpose, $$){');

			// 页面上的相关组件注册，仅release才做
			if ( env.release ) {
				srcJs.push('// 组件注册');
				srcJs.push('');
				oRef[pageTag].forEach(tag => {
					obj["'" + tag + "'"] = getComponentName(tag);
					srcJs.push( components[tag].js );

					srcCss.push( components[tag].css );
				});
			}

			srcJs.push( components[pageTag].js );
			srcJs.push('})(rpose, rpose.$$);');

			// 页面上的相关组件注册，仅release才做
			if ( env.release ) {
				srcJs[2] = 'rpose.registerComponents(' + JSON.stringify(obj).replace(/"/g,'') + ');\r\n';
			}

			srcCss.push( components[pageTag].css );

			pages[pageTag] = {
				js: csjs.formatJs( srcJs.join('\r\n') ),
				css: csjs.formatCss( srcCss.join('\r\n') )
			};
			console.debug(MODULE, pageTag);
		}

	};

}());
*/