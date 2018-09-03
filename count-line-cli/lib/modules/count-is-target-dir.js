const File = require('gotoeasy-file');
const event = require('../event');


module.exports = event.on('对象目录判断', function(){

	return (dir, project) => {
		let ignore = event.at('is-ignore', project);
		return !ignore.isIgnore(dir);
	}
}());

