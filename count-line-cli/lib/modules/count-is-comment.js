const File = require('gotoeasy-file');
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
	if ( ['java', 'js', 'ts', 'less', 'jsp', 'html', 'htm'].includes(ext)  ) {
		return line.indexOf('//') == 0;
	}else if ( ['sql'].includes(ext) ) {
		return line.indexOf('--') == 0;
	}else if ( ['properties', 'sh'].includes(ext) ) {
		return line.indexOf('#') == 0;
	}

	return false;
}

function isBlockCommentStart(ext, line){
	if ( ['java', 'js', 'ts', 'less', 'css'].includes(ext)  ) {
		return line.indexOf('/*') == 0;
	}else if ( ['xml', 'dtd', 'tld', 'jsp', 'html', 'htm'].includes(ext) ) {
		return line.indexOf('<!--') == 0;
	}

	return false;
}

function isBlockCommentEnd(ext, line){
	if ( ['java', 'js', 'ts', 'less', 'css'].includes(ext)  ) {
		return line.indexOf('*/') >= 0;
	}else if ( ['xml', 'dtd', 'tld', 'jsp', 'html', 'htm'].includes(ext) ) {
		return line.indexOf('-->') >= 0;
	}

	return false;
}
