const File = require('gotoeasy-file');
const event = require('../event');


module.exports = event.on('统计行数', function(){

	return (dirOrFile, project) => {

		if ( File.isFile(dirOrFile) ) {
			event.at('对象文件判断', dirOrFile, project) && event.at('统计文件行数', dirOrFile, project);
		}else{
			event.at('对象目录判断', dirOrFile, project) && File.files(dirOrFile).forEach( dof => event.at('统计行数', dof, project) );
		}

	};

}());
