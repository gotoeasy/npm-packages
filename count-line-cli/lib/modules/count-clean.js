const File = require('@gotoeasy/file');
const event = require('../event');


module.exports = event.on('清除', function(){

	return dirOrFile => {

		if ( File.isFile(dirOrFile) ) {
			event.at('对象文件判断', dirOrFile) && event.at('统计文件行数', dirOrFile);
		}else{
			event.at('对象目录判断', dirOrFile) && File.files(dirOrFile).forEach( dof => event.at('统计行数', dof) );
		}

	};

}());
