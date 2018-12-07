const File = require('@gotoeasy/file');
const PTask = require('@gotoeasy/p-task');
const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('编译RPOSE', function(pResult){

	let ary = __dirname.replace(/\\/g, '/').split('/');
	ary.pop() > ary.pop() > ary.pop();										// @gotoeasy/rpose目录
	let root = ary.join('/');

	let srcDir = root + '/src/rpose';
	let fileDist = root + '/src/rpose/dist/rpose.js';

	let ptask = new PTask((resolve, reject, isBroken) => async function(){

		
		try{
			if ( File.exists(fileDist) ) {
				resolve(File.read(fileDist));
			}else{
				let src = File.concat(srcDir, f=>!f.endsWith('rpose.js'));	// 合并除rpose.js以外的文件
				src = csjs.formatJs(src, true);								// 删除注释格式化

				resolve(src);

				Promise.resolve()
					.then( File.write(fileDist, src) )
					.catch(e=>console.error(MODULE, e));
			}
		}catch(e){
			reject(Error.err(MODULE + 'compile rpose failed', e));
		}
	});


	return () => ptask.start();

}());

