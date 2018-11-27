const bus = require('@gotoeasy/bus');
const fs = require('fs');

module.exports = bus.on('输出页面HTML文件', function(){


	// 异步输出页面JS文件
	return async function(btfFile){

		let file = bus.at('页面目标HTML文件名', btfFile);
		let source = await bus.at('生成页面HTML代码', btfFile);

		return new Promise((resolve, reject) => {
			fs.writeFile(file, source, (err, data) => {
				err ? reject(err) : resolve(btfFile);
			});
		});

	};


}());
