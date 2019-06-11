const File = require('@gotoeasy/file');

// ------------------------------------------
// opts.file			-	文件 （file/text二选一）
// opts.text			-	文件内容 （file/text二选一）
// 
// opts.start			-	开始位置（0~n），按位置时必须
// opts.end				-	结束位置（0~n） （可选，默认等于start）
//
// opts.line			-	焦点行（0~n），按行列时必须
// opts.column			-	焦点列（0~n），按行列时必须
//
// opts.startLine		-	焦点开始行（0~n），按行列范围时必须
// opts.startColumn		-	焦点开始行的开始列（0~n），按行列范围时必须
// opts.endLine			-	焦点结束行（0~n），按行列范围时必须
// opts.endColumn		-	焦点结束行的结束列（0~n），按行列范围时必须
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

	if ( opts.start < 0 || opts.start >= text.length ){
 //		console.debug('invalid arguments [03] - opts.start');
		return [];
	}

	opts.end < opts.start && (opts.end = opts.start);           // 开始位置等于结束位置时，焦点设定为，从开始位置到行末
	opts.end > text.length && (opts.end = text.length);

	// 计算开始行列
	let tmpLines = text.substring(0, opts.start).split(/\r?\n/);
	let lines = text.split(/\r?\n/);
	opts.startLine = tmpLines.length - 1;
	opts.startColumn = tmpLines[tmpLines.length-1].length;

	// 计算结束行列
	tmpLines = text.substring(0, opts.end).split(/\r?\n/);
	lines = text.split(/\r?\n/);
	opts.endLine = tmpLines.length - 1;
	opts.endColumn = tmpLines[tmpLines.length-1].length;

    return getCodefrmae(lines, opts);
}

function getCodefrmaeByFileLineCloumn(opts){

	// 检查及适当修复参数
	opts.line = parseInt(opts.line);
	opts.column = parseInt(opts.column);
	if ( isNaN(opts.line) || isNaN(opts.column) || opts.line < 0 || opts.column < 0 ) {
 //		console.debug('invalid arguments [04] - opts.line / opts.column');
		return [];
	}

	if ( typeof opts.text !== 'string' && typeof opts.file !== 'string' ) {
 //		console.debug('invalid arguments [05] - opts.text / opts.file');
		return [];
	}

	let text = getText(opts);
	let lines = text.split(/\r?\n/);
	if ( opts.line >= lines.length ){
 //		console.debug('invalid arguments [06] - opts.line');
		return [];
	}

	let sLine = lines[opts.line];
	opts.column >= sLine.length && (opts.column = sLine.length - 1);
	opts.column < 0 && (opts.column = 0);

	opts.startLine = opts.line;
	opts.startColumn = opts.column;
	opts.endLine = opts.line;
	opts.endColumn = sLine.length;
	return getCodefrmae(lines, opts);
}

function getCodefrmae(lines, opts){

	let rs = [];
	let numLen = ((opts.endLine + opts.linesBelow + 1) + '').length;        // 行号的最大长度
	pushAboveCodefrmae(rs, lines, opts.startLine, numLen, opts);            // 上方关联代码

	if ( opts.startLine === opts.endLine ) {
		opts.startColumn === opts.endColumn && (opts.endColumn = 999);
		rs.push( getCodeLeft(opts.startLine+1, numLen, true) + getCodeRight(lines[opts.startLine], opts) );                 // 目标行代码
		rs.push( getFocusLeft(numLen) + getFocusRight(lines[opts.startLine], opts.startColumn, opts.endColumn, opts) );     // 下标提示行^^^
	}else{
		for ( let i=opts.startLine,from,to; i<=opts.endLine; i++) {
			rs.push( getCodeLeft(i+1, numLen, true) + getCodeRight(lines[i], opts) ); // 目标代码

			if ( i === opts.startLine ) {
				from = opts.startColumn;
				to = 999;
			}else if ( i < opts.endLine ){
				from = 0;
				to = 999;
			}else{
				from = 0;
				to = opts.endColumn;
			}
			
			lines[i].trim() && rs.push( getFocusLeft(numLen) + getFocusRight(lines[i], from, to, opts) );                   // 下标提示行^^^ (空白行的时候省略提示行)
		}
	}

	pushBelowCodefrmae(rs, lines, opts.endLine+1, numLen, opts); // 下方关联代码

	return rs;
}

function pushAboveCodefrmae(rs, lines, line, numLen, opts){
	let start = line - opts.linesAbove;
	start < 0 && (start = 0);
	for ( let i=start; i<line; i++ ) {
		rs.push( getCodeLeft(i+1, numLen, false) + getCodeRight(lines[i], opts) );
	}
}

function pushBelowCodefrmae(rs, lines, line, numLen, opts){
	let max = line + opts.linesBelow;
	max > lines.length && (max = lines.length);
	for ( let i=line; i<max; i++ ) {
		rs.push( getCodeLeft(i+1, numLen, false) + getCodeRight(lines[i], opts) );
	}
}

function getCodeRight(lineCode, opts){
	let rs = lineCode.replace(/\t/g, opts.tab);
	return rs;
}
function getFocusRight(lineCode, fromPos, toPos, opts){
	let startColumn = lineCode.substring(0, fromPos).replace(/\t/g, opts.tab).length;
	let endColumn = lineCode.substring(0, toPos).replace(/\t/g, opts.tab).length;
	// TODO 有必要全角长度换算?
    return ' '.repeat(startColumn) + '^'.repeat(endColumn-startColumn);
}
function getCodeLeft(lineNo, numLen, isFocus){
	return (isFocus ? ' > ' : '   ') + lpad(lineNo, numLen) + ' | ';
}
function getFocusLeft(numLen){
	return ' '.repeat(3 + numLen) + ' | ';
}
function lpad(lineNo, numLen){
	let tmp = '          ' + lineNo;
	return tmp.substring(tmp.length - numLen);
}
function getText(opts){
	return typeof opts.text === 'string' ? opts.text : (File.exists(opts.file) ? File.read(opts.file) : '');
}

// getCodefrmaeByTextPos(opts)
// getCodefrmaeByFileLineCloumn(opts)
// getCodefrmae(lines, opts)
function getSingleCodefrmae(options){
	if ( !options || (!options.file && !options.text) || (options.start == null && options.line == null && options.startLine == null) ){
 //		console.debug('invalid arguments [07] - opts');
		return [];
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
			return [];
		}

		let text = getText(opts);
		let lines = text.split(/\r?\n/);

		opts.startLine = parseInt(opts.startLine);
		opts.startColumn = parseInt(opts.startColumn);
		opts.endLine = parseInt(opts.endLine);
		opts.endColumn = parseInt(opts.endColumn);

		if ( isNaN(opts.startLine) || isNaN(opts.startColumn) || isNaN(opts.endLine) || isNaN(opts.endColumn)
			|| opts.startLine < 0 || opts.startColumn < 0 || opts.endLine < 0 || opts.endColumn < 0
			|| opts.endLine < opts.startLine
			|| opts.startLine >= lines.length || opts.startColumn >= lines[opts.startLine].length || opts.endLine >= lines.length || opts.endColumn >= lines[opts.endLine].length
		) {
 //			console.debug('invalid arguments [09] - opts.startLine / opts.startColumn / opts.endLine / opts.endColumn');
			return [];
		}

		ary = getCodefrmae(lines, opts);
	}

    return ary;
}

function adjustCodefrmae(ary, maxLength=defaultOptions.maxLength){

	// 整理
	// 代码左边整体缩进过长时，统一去除整理
	let min = 999;
	for ( let i=0,rs,sLine; sLine=ary[i++]; ) {
        if ( sLine.startsWith(' ') && !sLine.startsWith('          .') ) {              // 特殊行除外
            rs = /\s{1,1}\|\s+/.exec(sLine);
            rs && (rs[0].length < min) && (min = rs[0].length);
        }
	}
	if ( min > 6 ) {
		for ( let i=0,rs; i<ary.length; i++ ) {
            if ( ary[i].startsWith(' ') && !ary[i].startsWith('          .') ) {        // 特殊行除外
                ary[i] = ary[i].replace(/\s{1,1}\|\s+/, function(match){
                    return ' |    ' + match.substring(min);
                });
            }
		}
	}

	// 整体过长时，统一去除加省略号
	for ( let i=0,rs; i<ary.length; i++ ) {
        if ( ary[i].startsWith(' ') && !ary[i].startsWith('          .') ) {            // 特殊行除外
            if ( ary[i].length > maxLength ) {
                ary[i] = ary[i].substring(0, maxLength - 4) + ' ...';                   // 代码行加省略号
                i++;
                ary[i] && (ary[i] = ary[i].substring(0, maxLength - 4));		        // 焦点行就算了吧
            }
		}
	}

    ary = ary.filter(v => v.trim() !== '|' );                                           // 删除空白焦点行
}

// 不同文件时的合并
function mergeCodefrmae(ary1, ary2){

    let ary = [];
    ary.push('---------------------------------------------------------------------');
    ary.push(ary1.file);

    if ( !ary2.length ){
        // 普通情况
        ary.push(...ary1);
    }else if ( ary1.file !== ary2.file ) {
        // 不同文件
        ary.push(...ary1);
        ary.push('-------------------------------------------------');
        ary.push(ary2.file);
        ary.push(...ary2);
    }else{
        // 相同文件
        ary1.startLine = getLineNo(ary1[0]);
        ary1.endLine = getLineNo(ary1[ary1.length-1]);
        !ary1.endLine && (ary1.endLine = getLineNo(ary1[ary1.length-2]));
        ary2.startLine = getLineNo(ary2[0]);
        ary2.endLine = getLineNo(ary2[ary2.length-1]);
        !ary2.endLine && (ary2.endLine = getLineNo(ary2[ary2.length-2]));

        adjustLeftLineNoSize(ary1, ary2);                   // 调整统一行号宽度

        mergeSingleFileCodefrmae(ary, ary1, ary2);
    }

    ary.push('---------------------------------------------------------------------');
    return ary;
}

function getLineNo(sLine=''){
    let match = sLine.match(/^\s+>?\s+(\d+)\s+|/);
    if ( match ) {
        return match[1] - 0;
    }
    return null;
}

function adjustLeftLineNoSize(ary1, ary2){
    if ( !ary1.length || !ary2.length ) {
        return;
    }

    let size1 = ary1[0].split('|')[0].length;
    let size2 = ary2[0].split('|')[0].length;

    if ( size1 > size2 ) {
        let space = ' '.repeat(size1-size2);
        for ( let i=0; i<ary2.length; i++ ) {
            if ( ary2[i].startsWith('  ') ) {
                ary2[i] = space + ary2[i];
            }else if ( ary2[i].startsWith(' >') ) {
                ary2[i] = ' >' + space + ary2[i].substring(2);
            }
        }
    }else if ( size2 > size1 ) {
        let space = ' '.repeat(size2-size1);
        for ( let i=0; i<ary1.length; i++ ) {
            if ( ary1[i].startsWith('  ') ) {
                ary1[i] = space + ary1[i];
            }else if ( ary1[i].startsWith(' >') ) {
                ary1[i] = ' >' + space + ary1[i].substring(2);
            }
        }
    }

}

// 同一文件时的合并
function mergeSingleFileCodefrmae(ary, ary1, ary2){

    if ( ary1.endLine < ary2.startLine ) {
        ary.push(...ary1);
        ary.push('          .');
        ary.push('          .');
        ary.push('          .');
        ary.push(...ary2);
    }else{

        let maxLen = Math.max(ary1.length, ary2.length);
        let idx1 = 0, idx2 = 0;
        let sLine1, sLine2;
        let lineNo1, lineNo2;
        for ( let i=0; i < maxLen; i++ ) {
            sLine1 = ary1[idx1];
            sLine2 = ary2[idx2];
            if ( !sLine1 && !sLine2 ) {
                break;
            }
            if ( !sLine1 ) {
                for ( let j=idx2; j < ary2.length; j++ ) {
                    ary.push(ary2[j]);
                }
                break;
            }
            if ( !sLine2 ) {
                for ( let j=idx1; j < ary1.length; j++ ) {
                    ary.push(ary1[j]);
                }
                break;
            }

            lineNo1 = getLineNo(sLine1);
            lineNo2 = getLineNo(sLine2);

            while ( lineNo1 < lineNo2  ) {
                ary.push(sLine1);

                sLine1 = ary1[++idx1];
                if ( !sLine1 ) {
                    break;
                }
                lineNo1 = getLineNo(sLine1);
                if ( !lineNo1 ) {
                    // 焦点行
                    ary.push(sLine1);
                    sLine1 = ary1[++idx1];
                    lineNo1 = getLineNo(sLine1);
                }
                if ( !lineNo1 ) {
                    break;
                }
            }
            if ( !lineNo1 ) {
                for ( let j=idx2; j < ary2.length; j++ ) {
                    ary.push(ary2[j]);
                }
                break;
            }

            // 这里开始行号已相同

            sLine2.startsWith(' >') ? ary.push(sLine2) : ary.push(sLine1);     // 代码行

            sLine1 = ary1[++idx1];
            sLine2 = ary2[++idx2];

            if ( !sLine1 ) {
                for ( let j=idx2-1; j < ary2.length; j++ ) {
                    ary.push(ary2[j]);
                }
                break;
            }
            if ( !sLine2 ) {
                for ( let j=idx1-1; j < ary1.length; j++ ) {
                    ary.push(ary1[j]);
                }
                break;
            }

            lineNo1 = getLineNo(sLine1);
            lineNo2 = getLineNo(sLine2);
            if ( !lineNo1 && !lineNo2 ) {
                // 都是焦点行，合并焦点
                let chs1 = sLine1.split('');
                let chs2 = sLine2.split('');
                let str = '', max = Math.max(chs1.length, chs2.length);
                for ( let idx=0,ch1,ch2; idx<max; idx++ ) {
                    ch1 = chs1[idx] || ' ';
                    ch2 = chs2[idx] || ' ';
                    str += (ch1 === ' ' ? ch2 : ch1);
                }
                ary.push(str);

                idx1++;
                idx2++;
            }else if ( !lineNo1 ) {
                // 其一焦点行
                ary.push(sLine1);
                idx1++;
            }else if ( !lineNo2 ) {
                // 其二焦点行
                ary.push(sLine2);
                idx2++;
            }else{
                // 仍旧代码行，下个循环继续做
            }
        }
    }

}

module.exports = function (opts1, opts2={}){
    let ary1 = getSingleCodefrmae(opts1);
    opts1 && opts1.file && (ary1.file = opts1.file);
    let ary2 = getSingleCodefrmae(opts2);
    opts2 && opts2.file && (ary2.file = opts2.file);

    let ary;
    let startNo1 = getLineNo(ary1[0]);
    let startNo2 = getLineNo(ary2[0]);
    if ( startNo1 && startNo2 && startNo1 > startNo2 ) {
        ary = mergeCodefrmae(ary2, ary1);
    }else{
        ary = mergeCodefrmae(ary1, ary2);
    }

    let maxLength1 = (opts1 && opts1.maxLength) || defaultOptions.maxLength;
    let maxLength2 = (opts2 && opts2.maxLength) || defaultOptions.maxLength;
    let maxLength = Math.max(maxLength1, maxLength2);

    adjustCodefrmae(ary, maxLength);	// 整理

    return ary.join('\n')
}
