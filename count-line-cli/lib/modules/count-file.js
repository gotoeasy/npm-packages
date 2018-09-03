const File = require('gotoeasy-file');
const event = require('../event');


module.exports = event.on('统计文件行数', function(){

	return (file, project) => {
		let result = {total: 0, blank: 0, comment: 0, code: 0, file:file}
		let oFlg = {isBlockCommentStart: false}, ext = getFileExt(file);
		let lines = File.read(file).split('\n').map(s=>s.trim());

		for ( let i=0; i<lines.length; i++ ) {
			countLine(ext, lines[i], result, oFlg);
		}

		event.at('统计项目行数')[project].list.push(result);
		return result;
	};


}());



function countLine(ext, line, result, oFlg){

	!oFlg.isBlockCommentStart && (oFlg.isBlockCommentStart = isBlockCommentStart(ext, line));

	result.total++;
	if ( line == '' ) {
		result.blank++;
	} else if ( oFlg.isBlockCommentStart || isLineComment(ext, line) ) {
		result.comment++;
	} else {
		result.code++;
	}

	(oFlg.isBlockCommentStart && isBlockCommentEnd(ext, line)) && (oFlg.isBlockCommentStart = false);
}

function isLineComment(ext, line){
	return event.at('注释判断', ext, line, 0);
}

function isBlockCommentStart(ext, line){
	return event.at('注释判断', ext, line, 10);
}

function isBlockCommentEnd(ext, line){
	return event.at('注释判断', ext, line, 11);
}

function getFileExt(file){
	let name = file.substring(file.lastIndexOf('/')+1);
	return name.indexOf('.') >=0 ? name.substring(name.lastIndexOf('.')+1) : '';
}