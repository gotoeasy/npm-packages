const File = require('@gotoeasy/file');

// ------------------------------------------
// opts.file			-	文件 （file/text二选一）
// opts.text			-	文件内容 （file/text二选一）
// 
// opts.start			-	开始位置（1~n），按位置时必须
// opts.end				-	结束位置（1~n） （可选，默认等于start）
//
// opts.line			-	焦点行（1~n），按行列时必须
// opts.column			-	焦点列（1~n），按行列时必须
//
// opts.startLine		-	焦点开始行（1~n），按行列范围时必须
// opts.startColumn		-	焦点开始行的开始列（1~n），按行列范围时必须
// opts.endLine			-	焦点结束行（1~n），按行列范围时必须
// opts.endColumn		-	焦点结束行的结束列（1~n），按行列范围时必须
//
// opts.tab				-	默认4个半角空格
// opts.linesAbove		-	上方显示代码的行数
// opts.linesBelow		-	下方显示代码的行数
// opts.maxLength		-	单行显示最大长度，超出部分省略号显示
// ------------------------------------------
// API
// const codeframe = require('@gotoeasy/code-frame');
// let result;
// result = codeframe({text: '12345\n6789', start:2});
// result = codeframe({text: '12345\n6789', start:2, end: 4});
// result = codeframe({file: 'd:/file.txt', start:2});
// result = codeframe({file: 'd:/file.txt', start:2, end: 4});
// result = codeframe({text: '12345\n6789', line:2, column:3});
// result = codeframe({file: 'd:/file.txt', line:2, column:3});
// result = codeframe({text: '12345\n6789', startLine:1, startColumn:3, endLine:2, endColumn:4, tab:'    '});
// result = codeframe({file: 'd:/file.txt', startLine:1, startColumn:3, endLine:2, endColumn:4, tab:'  '});
// ------------------------------------------
const defaultOptions = {tab:'    ', linesAbove:3, linesBelow:3, maxLength:120};

function getCodefrmaeByTextPos(options){
    let opts = Object.assign({}, options);
	// 检查及适当修复参数
	opts.start = parseInt(opts.start);
	opts.end = (opts.end == null ? opts.start : parseInt(opts.end));
	if ( isNaN(opts.start) || isNaN(opts.end) ) {
//		console.debug('invalid arguments [01] - opts.start / opts.end');
		return [];
	}

	if ( typeof opts.text !== 'string' && typeof opts.file !== 'string' ) {
//		console.debug('invalid arguments [02] - opts.text / opts.file');
		return [];
	}
	let text = getText(opts);

	if ( opts.start < 1 || opts.start > text.length ){
//		console.debug('invalid arguments [03] - opts.start');
		return [];
	}

	opts.end < opts.start && (opts.end = opts.start);
	opts.end > text.length && (opts.end = text.length);

	// 计算开始行列
	let tmpLines = text.substring(0, opts.start).split(/\r?\n/);
	let lines = text.split(/\r?\n/);
	opts.startLine = tmpLines.length;
	opts.startColumn = tmpLines[tmpLines.length-1].length;

    if ( opts.startColumn === 0 && options.start) {
        options.start++;
        return getCodefrmaeByTextPos(options);
    }

	// 计算结束行列
	tmpLines = text.substring(0, opts.end).split(/\r?\n/);
	lines = text.split(/\r?\n/);
	opts.endLine = tmpLines.length;
	opts.endColumn = tmpLines[tmpLines.length-1].length;

    return getCodefrmae(lines, opts);
}

function getCodefrmaeByFileLineCloumn(opts){

	// 检查及适当修复参数
	opts.line = parseInt(opts.line);
	opts.column = parseInt(opts.column);
	if ( isNaN(opts.line) || isNaN(opts.column) || opts.line < 1 || opts.column < 1 ) {
//		console.debug('invalid arguments [04] - opts.line / opts.column');
		return [];
	}

	if ( typeof opts.text !== 'string' && typeof opts.file !== 'string' ) {
//		console.debug('invalid arguments [05] - opts.text / opts.file');
		return [];
	}

	let text = getText(opts);
	let lines = text.split(/\r?\n/);
	if ( opts.line > lines.length ){
//		console.debug('invalid arguments [06] - opts.line');
		return [];
	}

	let sLine = lines[opts.line-1];
	opts.column > sLine.length && (opts.column = sLine.length)

	opts.startLine = opts.line;
	opts.startColumn = opts.column;
	opts.endLine = opts.line;
	opts.endColumn = sLine.length;
	return getCodefrmae(lines, opts);
}

function getCodefrmae(lines, opts){

	let rs = [];
	let numLen = ((opts.endLine + opts.linesBelow) + '').length;
	pushAboveCodefrmae(rs, lines, opts.startLine, numLen, opts); // 上方关联代码

	if ( opts.startLine === opts.endLine ) {
		opts.startColumn === opts.endColumn && (opts.endColumn = 99999);
		rs.push( getCodeLeft(opts.startLine, numLen, true) + getCodeRight(lines[opts.startLine-1], opts) ); // 目标代码
		rs.push( getFocusLeft(numLen) + getFocusRight(lines[opts.startLine-1], opts.startColumn, opts.endColumn, opts) ); // 下标提示行^^^
	}else{
		for ( let i=opts.startLine-1,from,to; i<opts.endLine; i++) {
			rs.push( getCodeLeft(i+1, numLen, true) + getCodeRight(lines[i], opts) ); // 目标代码

			if ( i === (opts.startLine - 1) ) {
				from = opts.startColumn;
				to = 999;
			}else if ( i < (opts.endLine - 1) ){
				from = 1;
				to = 999;
			}else{
				from = 1;
				to = opts.endColumn;
			}
			
			lines[i].trim() && rs.push( getFocusLeft(numLen) + getFocusRight(lines[i], from, to, opts) ); // 下标提示行^^^ (空白行的时候省略提示行)
		}
	}

	pushBelowCodefrmae(rs, lines, opts.endLine, numLen, opts); // 下方关联代码

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
	return rs;
}
function getFocusRight(code, fromPos, toPos, opts){
	let startColumn = code.substring(0, fromPos).replace(/\t/g, opts.tab).length;
	let endColumn = code.substring(0, toPos).replace(/\t/g, opts.tab).length;
	// TODO 有必要全角长度换算?
    return ' '.repeat(startColumn-1) + '^'.repeat(endColumn-startColumn+1);
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
function getText(opts){
	return typeof opts.text === 'string' ? opts.text : (File.exists(opts.file) ? File.read(opts.file) : '');
}

// getCodefrmaeByTextPos(opts)
// getCodefrmaeByFileLineCloumn(opts=)
// getCodefrmae(lines, opts)
module.exports = function (options){
	if ( !options || (!options.file && !options.text) || (!options.start && !options.line && !options.startLine) ){
//		console.debug('invalid arguments [07] - opts');
		return '';
	}

	let opts = Object.assign({}, defaultOptions, options);

	let ary;
	if ( opts.line ) {
		// 按行列
		ary = getCodefrmaeByFileLineCloumn(opts);
	}else if ( opts.start ) {
		// 按位置
		ary = getCodefrmaeByTextPos(opts);
	}else{
		// 按行列范围
		if ( typeof opts.text !== 'string' && typeof opts.file !== 'string' ) {
//			console.debug('invalid arguments [08] - opts.text / opts.file');
			return '';
		}

		let text = getText(opts);
		let lines = text.split(/\r?\n/);

		opts.startLine = parseInt(opts.startLine);
		opts.startColumn = parseInt(opts.startColumn);
		opts.endLine = parseInt(opts.endLine);
		opts.endColumn = parseInt(opts.endColumn);

		if ( isNaN(opts.startLine) || isNaN(opts.startColumn) || isNaN(opts.endLine) || isNaN(opts.endColumn)
			|| opts.startLine < 1 || opts.startColumn < 1 || opts.endLine < 1 || opts.endColumn < 1
			|| opts.endLine < opts.startLine
			|| opts.startLine > lines.length || opts.startColumn > lines[opts.startLine-1].length || opts.endLine > lines.length || opts.endColumn > lines[opts.endLine-1].length
		) {
//			console.debug('invalid arguments [09] - opts.startLine / opts.startColumn / opts.endLine / opts.endColumn');
			return '';
		}

		ary = getCodefrmae(lines, opts);
	}

	// 整理
	// 代码左边整体缩进过长时，统一去除整理
	let min = 999;
	for ( let i=0,rs; i<ary.length; i++ ) {
		rs = /\s{1,1}\|\s+/.exec(ary[i]);
		rs && (rs[0].length < min) && (min = rs[0].length);
	}
	if ( min > 6 ) {
		for ( let i=0,rs; i<ary.length; i++ ) {
			ary[i] = ary[i].replace(/\s{1,1}\|\s+/, function(match){
				return ' |    ' + match.substring(min);
			});
		}
	}

	// 整体过长时，统一去除加省略号
	for ( let i=0,rs; i<ary.length; i++ ) {
		if ( ary[i].length > opts.maxLength ) {
			ary[i] = ary[i].substring(0, opts.maxLength - 4) + ' ...'; // 代码行加省略号
			i++;
			ary[i] = ary[i].substring(0, opts.maxLength - 4);		   // 焦点行就算了吧
		}
	}

	return ary.join('\n');
}
