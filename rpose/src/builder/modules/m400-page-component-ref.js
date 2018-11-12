// ---------------------------
// 页面组件引用清单
// ---------------------------
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');


const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('页面引用组件', function(){

	return function(){

		const manager = bus.at('编译管理');
		const tags = manager.tags;
		const tagRequires = manager.tagRequires;  // 组件tag： 组件直接依赖的其他组件
		const tagRequireAll = manager.tagRequireAll;  // 组件tag： 组件依赖的所有组件
		const env = bus.at('编译环境');

console.debug(MODULE, '----------', tagRequires);
		
		tags.forEach(tag => {
			let oSetAll = new Set(), oStatus = {};
			setRefTag(oSetAll, tag, oStatus, tagRequires);
			let ary = [...oSetAll];
			ary.sort();
//console.info(MODULE, tag, '--------',  ary);
			tagRequireAll[tag] = ary;
		});
		
		if ( env.debug ) {
			let obj = {};
			for ( let k in tagRequireAll ) {
				obj[k] = [...tagRequireAll[k]];
			}
			console.debug(MODULE, 'component ref', JSON.stringify(obj, null, 2));
		}
	};

}());

// tag: 要查询的根组件tag
function setRefTag(oSet, tag, oStatus, oTagRequires){
	if ( oStatus[tag] ) {
		return;
	}


//	oSet.add(tag);
	oStatus[tag] = true;

	(oTagRequires[tag] || new Set).forEach( t => {
		oSet.add(t);
		setRefTag(oSet, t, oStatus, oTagRequires);
	});

}
