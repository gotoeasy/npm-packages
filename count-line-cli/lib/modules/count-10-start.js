const File = require('gotoeasy-file');
const event = require('../event');


module.exports = event.on('统计项目行数', function(result={}){

	return (path, project) => {

		if ( !path ) {
			return result;
		}

		if ( !File.exists(path) ) {
			throw new Error('path not found! (' + path + ')');
		}


		result[project] = {project: project, path: path, list: []};

		console.log('start count line ......', project);

		event.at('统计行数', path, project);
		//event.at('统计信息输出', path, project);
	};

}());
