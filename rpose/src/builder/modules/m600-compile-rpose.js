const File = require('@gotoeasy/file');
const PTask = require('@gotoeasy/p-task');
const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('编译RPOSE', function(pResult){

	let ary = __dirname.replace(/\\/g, '/').split('/');
	ary.pop() > ary.pop() > ary.pop();
	let root = ary.join('/');

	let srcDir = root + '/src/rpose';
	let fileDist = root + '/dist/rpose.js';

	let ptask = new PTask((resolve, reject, isBroken) => async function(){
		let src = File.concat(srcDir);	// 合并源码
		src = csjs.formatJs(src, true); // 删除注释

console.debug(MODULE, 'rpose compile ok');
		resolve(src);

		Promise.resolve()
			.then( File.write(fileDist, src) )
			.catch(e=>console.error(MODULE, e));
	});


	return () => ptask.start();

}());

