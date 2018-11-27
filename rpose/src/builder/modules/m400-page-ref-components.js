// ---------------------------
// 页面组件引用清单
// ---------------------------
const bus = require('@gotoeasy/bus');


const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('查找页面依赖组件', function(){

	return async function(btfFile){
		let allrequires;
		try{
			let oSetAllRequires = new Set(), oStatus = {};
			let btfRs = await bus.at('编译源文件', btfFile);
			for ( let i=0,tagpkg; tagpkg=btfRs.requires[i++]; ) {
				await addRefComponent(tagpkg, oSetAllRequires, oStatus);
			}

			// 排序确保每次输出保持一致
			allrequires = [...oSetAllRequires];
			allrequires.sort();
			
			console.debug(MODULE, btfFile, '\n    allrequires', allrequires);
		}catch(e){
			console.error(MODULE, 'find ref components failed');
			throw e;
		}

	
		// 等待关联组件全部编译完成
		let ary = [];
		allrequires.forEach( tagpkg => ary.push(bus.at('编译组件', tagpkg)) );
		try{
			await Promise.all( ary );
		}catch(e){
			console.error(MODULE, 'find ref components failed');
			throw e;
		}

		// 最后加入本页面标签
		let tag = bus.at('默认标签名', btfFile);
		!allrequires.includes(tag) && allrequires.push( tag );
	
//console.info(MODULE, '------------allrequires------------', btfFile, allrequires);
		return allrequires;
	};

}());


// tagpkg: 待添加依赖组件
async function addRefComponent(tagpkg, oSetAllRequires, oStatus){
	if ( oStatus[tagpkg] ) {
		return;
	}

	oSetAllRequires.add(tagpkg);
	oStatus[tagpkg] = true;

	let btfRs = await bus.at('编译源文件', tagpkg);
	for ( let i=0,subTagpkg; subTagpkg=btfRs.requires[i++]; ) {
		await addRefComponent(subTagpkg, oSetAllRequires, oStatus);
	}
}
