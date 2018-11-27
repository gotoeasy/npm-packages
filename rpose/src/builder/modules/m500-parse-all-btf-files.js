const bus = require('@gotoeasy/bus');
const PTask = require('@gotoeasy/p-task');
const File = require('@gotoeasy/file');
const Btf = require('@gotoeasy/btf');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('解析全部源文件', function(){

	return async function () {
console.info(MODULE, '------------parse all btf-----------');
		let files = bus.at('源文件清单');
		let promises = [], pages = [];

		files.forEach( file => promises.push(bus.at('解析源文件', file)) )

		try{
			await Promise.all(promises);
		}catch(e){
			console.error(MODULE, 'parse all btf failed');
			throw e;
		}
	};

}());




/*


(function (){
	let mapTagFile = new Map();
	let mapFileTag = new Map();
	let finished = false;

	let promises = [];

	bus.on('单个源文件解析完成', function(btfFile, tagPkg){
		mapTagFile.set(btfFile, tagPkg);
		mapTagFile.set(tagPkg, btfFile);

		(bus.at('源文件清单').length == mapTagFile.size) && bus.at('全部源文件解析完成');
	});

	bus.on('全部源文件解析完成', function(flag){
		if ( flag != undefined ) {
			isFinished = flag;
		}

		if ( flag ) {
			promises.forEach(rs=>{
				if ( rs.tagPkg ) {
					mapTagFile.has(rs.tagPkg) ? rs.resolve(mapTagFile.get(rs.tagPkg)) : rs.reject('source file not found [' + rs.tagPkg + ']')
				}
				if ( rs.file ) {
					mapFileTag.has(rs.file) ? rs.resolve(mapFileTag.get(rs.file)) : rs.reject('tag not found [' + rs.file + ']')
				}
			});
			promises = [];
		}

		return isFinished;
	});

	bus.on('标签相应源文件', function(tagPkg){

		if ( finished ) {
			return mapTagFile.has(tagPkg) ? Promise.resolve(mapTagFile.get(tagPkg)) : Promise.reject('source file not found [' + tagPkg + ']');
		}

		let rs = {};
		rs.promise = new Promise((resolve, reject)=>{
			rs.tagPkg = tagPkg;
			rs.resolve = resolve;
			rs.reject = reject;
		});
		promises.push(rs);
		return rs.promise; // TODO 异步混乱导致超时？
	});

	bus.on('源文件相应标签', function(btfFile){

		if ( finished ) {
			return mapFileTag.has(btfFile) ? Promise.resolve(mapFileTag.get(btfFile)) : Promise.reject('tag not found [' + btfFile + ']');
		}

		let rs = {};
		rs.promise = new Promise((resolve, reject)=>{
			rs.file = btfFile;
			rs.resolve = resolve;
			rs.reject = reject;
		});
		promises.push(rs);
		return rs.promise; // TODO 异步混乱导致超时？
	});

}());


*/