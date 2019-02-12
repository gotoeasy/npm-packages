const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const PTask = require('@gotoeasy/p-task');


const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('查找页面依赖组件', function(){

	let ptask = new PTask((resolve, reject, isBroken) => async function(srcFile){
		try{
			let oSetAllRequires = new Set(), oStatus = {};
			let oCompile = await bus.at('编译源文件', srcFile);
			let requires = oCompile.requires || [];
//console.info(MODULE, '------------requires------------', requires);
			for ( let i=0,tagpkg; tagpkg=requires[i++]; ) {
				await addRefComponent(tagpkg, oSetAllRequires, oStatus);
			}

			// 排序确保每次输出保持一致
			let allrequires = [...oSetAllRequires];
			allrequires.sort();
			let tag = bus.at('默认标签名', srcFile);
			!allrequires.includes(tag) && allrequires.push( tag ); // 最后加入本页面标签
			
//console.info(MODULE, srcFile, '\n    allrequires', allrequires);

	
			// 等待关联组件全部编译完成
			let ary = [];
			allrequires.forEach( tagpkg => ary.push( bus.at('编译组件', tagpkg )) );
			await Promise.all( ary );

			resolve( allrequires );
		}catch(e){
			reject( Err.cat(MODULE + 'find ref components failed', e) );
		}
	});

	return function(srcFile, restart=false){
		restart && bus.at('编译源文件', srcFile).catch(console.error);
		return restart ? ptask.restart(srcFile) : ptask.start(srcFile);
	};

}());


// tagpkg: 待添加依赖组件
async function addRefComponent(tagpkg, oSetAllRequires, oStatus){
	if ( oStatus[tagpkg] ) {
		return;
	}

	oSetAllRequires.add(tagpkg);
	oStatus[tagpkg] = true;

	let oComp = await bus.at('编译组件', tagpkg);
	let requires = oComp.requires;

    for ( let i=0,subTagpkg; subTagpkg=requires[i++]; ) {
		await addRefComponent(subTagpkg, oSetAllRequires, oStatus);
	}
}
