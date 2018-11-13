const File = require('@gotoeasy/file');
const event = require('../event');


module.exports = event.on('注释判断', function(){

	return function(ext, line, type=0) { // type: 0=单行注释判断，10=多行注释开始行判断，11=多行注释结束行判断
		if ( type == 0 ) {
			return isLineComment(ext, line);
		}
		if ( type == 10 ) {
			return isBlockCommentStart(ext, line);
		}
		if ( type == 11 ) {
			return isBlockCommentEnd(ext, line);
		}
	};
}());



function isLineComment(ext, line){
	let env = event.at('环境');
	let str = env.extComment[ext] ? (env.extComment[ext].get('line-comment') || '') : '';
	return str && line.indexOf(str) == 0
}

function isBlockCommentStart(ext, line){
	let mapComment = event.at('环境').extComment[ext];
	if ( !mapComment ) {
		return false;
	}

	// block-comment-start
	let start = mapComment.get('block-comment-start');
	let end = mapComment.get('block-comment-end');
	let rs = (start && line.indexOf(start) == 0);
	if ( rs ) {
		mapComment.set('$current-block-comment-end', end);
		return rs;
	}

	for ( let i=1; i<=3; i++) {
		// block-comment-start1 ~ block-comment-start3
		start = mapComment.get('block-comment-start' + i);
		end = mapComment.get('block-comment-end' + i);
		rs = (start && line.indexOf(start) == 0);
		if ( rs ) {
			mapComment.set('$current-block-comment-end', end);
			return rs;
		}
	}

	mapComment.set('$current-block-comment-end', '');
	return rs;
}

function isBlockCommentEnd(ext, line){
	let mapComment = event.at('环境').extComment[ext];
	if ( !mapComment ) {
		return true;
	}

	let end = mapComment.get('$current-block-comment-end');
	return line.indexOf(end) >= 0;
}
