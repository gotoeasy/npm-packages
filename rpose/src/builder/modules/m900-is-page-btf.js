const bus = require('@gotoeasy/bus');

module.exports = bus.on('是否页面源文件', function(){

	// 判断是否页面源文件
	return function(btfFile){
		let env = bus.at('编译环境');
		return btfFile.startsWith(env.path.src_pages);
	}

}());
