const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('编译全部页面', function(){

	return async function(){
		let env = bus.at('编译环境');

		let files = bus.at('源文件清单');
		let pages = [];

		for ( let i=0,file; file=files[i++]; ) {
			bus.at('编译组件', file).catch(e=>console.error(MODULE, e));
			bus.at('是否页面源文件', file) && pages.push(file);
		}

		let ary = [];
		pages.forEach(file => ary.push(bus.at('输出页面代码文件', file)) );
		await Promise.all(ary);
	};


}());

