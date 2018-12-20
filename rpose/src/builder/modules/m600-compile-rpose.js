const Err = require('@gotoeasy/err');
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
			let src = File.concat(srcDir, f=>!f.endsWith('rpose.js'));	// 合并除rpose.js以外的文件
			resolve(src);

			// 非release时输出文件方便查看
			let env  = bus.at('编译环境');
			!env.release && Promise.resolve()
				.then( File.write(fileDist, csjs.formatJs(src, true)) )
				.catch(e=>console.error(MODULE, e));
		}catch(e){
			reject(Err.cat(MODULE + 'compile rpose failed', e));
		}
	});


	return () => ptask.start();

}());

