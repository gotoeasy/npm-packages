const File = require('gotoeasy-file');
const event = require('../event');

module.exports = event.on('对象文件判断', function(){

	return (file, project) => {
		let ignore = event.at('is-ignore', project);
		return !ignore.isIgnore(file) && isTargetFile(file);
	}

}());



function isTargetFile(file){
	return event.at('环境').exts.includes(getFileExt(file));
}

function getFileExt(file){
	let name = file.substring(file.lastIndexOf('/')+1);
	return name.indexOf('.') >=0 ? name.substring(name.lastIndexOf('.')+1) : '';
}