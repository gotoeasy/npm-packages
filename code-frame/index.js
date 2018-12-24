const File = require('@gotoeasy/file');

// ------------------------------------------
// opts.fileContent
// opts.offset
// opts.tab
// opts.linesAbove
// opts.linesBelow
// opts.maxCodeLength
// ------------------------------------------

function getCodefrmaeByTextPos(text, posFrom, posTo, opts={}){
	try{
		posFrom = posFrom - 0;
		posTo && (posTo = posTo - 0);
	}catch(e){
		return [];
	}

	// 检查及适当修复参数
	if ( typeof text !== 'string' || posFrom < 0 || posFrom >= text.length ) return [];
	(!posTo || posTo<posFrom) && (posTo = posFrom);
	posTo >= text.length && (posTo = text.length-1);

	// 计算开始行列
	let tmpLines,lines;
	if ( opts.fileContent && opts.offset ) {
		tmpLines = opts.fileContent.substring(0, posFrom + opts.offset).split(/\n/);
		lines = opts.fileContent.split(/\n/);
	}else{
		tmpLines = text.substring(0, posFrom).split(/\n/);
		lines = text.split(/\n/);
	}
	let lineFrom = tmpLines.length;
	let colFrom = tmpLines[tmpLines.length-1].length;

	// 计算结束行列
	if ( opts.fileContent && opts.offset ) {
		tmpLines = opts.fileContent.substring(0, posTo + opts.offset).split(/\n/);
		lines = opts.fileContent.split(/\n/);
	}else{
		tmpLines = text.substring(0, posTo).split(/\n/);
		lines = text.split(/\n/);
	}
	let lineTo = tmpLines.length;
	let colTo = tmpLines[tmpLines.length-1].length;

	// 选项
	let options = Object.assign({tab:'    ', linesAbove:3, linesBelow:3, maxCodeLength:200}, opts);

	return getCodefrmae(lines, lineFrom, colFrom, lineTo, colTo, options);
}

function getCodefrmaeByFileLineCloumn(file, line, column, opts={}){

	try{
		line = line - 0;
		column = column - 0;
	}catch(e){
		return [];
	}

	// 检查及适当修复参数
	if ( line < 1 || !File.exists(file) ) return [];
	let text = File.read(file);
	let lines = text.split(/\n/);
	if ( line > lines.length )  return [];
	let sLine = lines[line-1];

	column < 0 && (column = 0)
	column >= sLine.length && (column = sLine.length-1)

	let options = Object.assign({tab:'    ', linesAbove:3, linesBelow:3, maxCodeLength:200}, opts);
	return getCodefrmae(lines, line, column, line, sLine.length-1, options);
}

function getCodefrmae(lines, lineFrom, colFrom, lineTo, colTo, opts){

	let rs = [];
	let numLen = ((lineTo + opts.linesBelow) + '').length;

	pushAboveCodefrmae(rs, lines, lineFrom, numLen, opts); // 上方关联代码

	if ( lineFrom === lineTo ) {
		colFrom === colTo && (colTo = opts.maxCodeLength);
		rs.push( getCodeLeft(lineFrom, numLen, true) + getCodeRight(lines[lineFrom-1], opts) ); // 目标代码
		rs.push( getFocusLeft(numLen) + getFocusRight(lines[lineFrom-1], colFrom, colTo, opts) ); // 下标提示行^^^
	}else{
		for ( let i=lineFrom-1,from,to; i<lineTo; i++) {
			rs.push( getCodeLeft(i+1, numLen, true) + getCodeRight(lines[i], opts) ); // 目标代码

			if ( i === (lineFrom - 1) ) {
				from = colFrom;
				to = 999;
			}else if ( i < (lineTo - 1) ){
				from = 0;
				to = 999;
			}else{
				from = 0;
				to = (colTo === 0 ? 1 : colTo);
			}
			
			rs.push( getFocusLeft(numLen) + getFocusRight(lines[i], from, to, opts) );
		}
	}

	pushBelowCodefrmae(rs, lines, lineTo, numLen, opts); // 下方关联代码

	return rs;
}

function pushAboveCodefrmae(rs, lines, line, numLen, opts){
	let start = line - opts.linesAbove - 1;
	start < 0 && (start = 0);
	for ( let i=start; i<line-1; i++ ) {
		rs.push( getCodeLeft(i+1, numLen, false) + getCodeRight(lines[i], opts) );
	}
}

function pushBelowCodefrmae(rs, lines, line, numLen, opts){
	let end = line + 3;
	end >= lines.length && (end = lines.length);
	for ( let i=line; i<end; i++ ) {
		rs.push( getCodeLeft(i+1, numLen, false) + getCodeRight(lines[i], opts) );
	}
}

function getCodeRight(code, opts){
	let rs = code.replace(/\t/g, opts.tab);
	if ( rs.length > opts.maxCodeLength ) {
		rs = rs.substring(0, opts.maxCodeLength - 5) + ' ... ';
	}
	return rs;
}
function getFocusRight(code, from, to, opts){
	let start = code.substring(0, from).replace(/\t/g, opts.tab).length;
	let end = code.substring(0, to).replace(/\t/g, opts.tab).length;
	end > opts.maxCodeLength && (end = opts.maxCodeLength-1);
	// TODO 全角长度换算
	return ' '.repeat(start) + '^'.repeat(end-start);
}
function getCodeLeft(lineNo, numLen, isFocus){
	return (isFocus ? ' > ' : '   ') + lpad(lineNo, numLen) + ' | ';
}
function getFocusLeft(numLen){
	return ' '.repeat(3 + numLen) + ' | ';
}
function lpad(lineNo, numLen){
	let tmp = ' '.repeat(numLen) + lineNo;
	return tmp.substring(tmp.length - numLen);
}


module.exports = function (...args){
	if ( args.length < 2 ) return '';

	let ary = File.exists(args[0]) ? getCodefrmaeByFileLineCloumn(...args) : getCodefrmaeByTextPos(...args);
	// TODO 去过长的空白
	return ary.join('\n');
}
