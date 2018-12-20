const File = require('@gotoeasy/file');
const babelCodeFrame = require('@babel/code-frame');

class Err extends Error{
	constructor(msg, opts) {
		super();
		if ( typeof msg === 'string' ) {
			this.message = msg;
		}else if ( Object.prototype.toString.call(msg) === '[object Object]' ) {
			opts = msg;
		}

		Object.defineProperty(this, "codeframe", {value : null, writable : true} );

		if ( Object.prototype.toString.call(opts) === '[object Object]' ) {
			let text = opts.text;
			let start = opts.start;
			let end = opts.end;
			if ( text != null && start != null ) {
				// 文件内容+位置
				this.codeframe = getCodeframeByTextPos(text, start, end);
				this.stack = this.codeframe + '\n' + this.stack;
			}
		}else{
			setCodeframe(this);
		}
	}

	toString() {
		return this.stack;
	}

}

function setCodeframe(e){
	if ( !(e instanceof Err) && e.codeframe === undefined ) {
		Object.defineProperty(e, "codeframe", {value : null, writable : true} );
		e.toString = function(){
			return this.stack;
		}
	}

	if ( e.codeframe == null ) {
		let stacks = e.stack.split('\n');
		for ( let i=0,str; str=stacks[i++]; ) {
			if ( /\:\d+\:\d+/.test(str) ) {
				// 从堆栈信息中查找出错文件，堆栈信息格式有所不同需判断处理
				e.codeframe == null && str.replace(/^\s*at\s?([\s\S]*?)\:(\d+)\:*(\d*)$/, function(match, $file, $line, $col){				// 【    at file:line:col】
					if ( File.exists($file) ) {
						e.codeframe = getCodeframeByFileLineColumn($file, $line, $col);
						e.stack = e.codeframe + '\n' + e.stack;
					}
				});

				e.codeframe == null && str.replace(/^\s*at\s?[\s\S]*?\(([\s\S]*?)\:(\d+)\:*(\d*)\)$/, function(match, $file, $line, $col){	// 【    at *** (file:line:col)】
					if ( File.exists($file) ) {
						e.codeframe = getCodeframeByFileLineColumn($file, $line, $col);
						e.stack = e.codeframe + '\n' + e.stack;
					}
				});

				if ( e.codeframe ) {
					break;
				}
			}
		}
		e.codeframe == null && (e.codeframe = ''); // 避免往后重复执行setCodeframe
	}
	return e;
}

// 自定义指定位置
function getCodeframeByFilePos(file, pos){
	let src, tmp, arySrc, aryTmp, line, columnFrom, columnTo, index=pos;

	src = File.read(file);					// 文件存在性在调用前已经查
	if ( index > src.length ) return '';	// 位置超长的参数错误不处理
	
	let cf = getCodeframeByTextPos(src, index);
	return file + cf;
}

// 自定义指定位置
function getCodeframeByTextPos(text, start, end){
	let aryText, aryTmpStart, aryTmpEnd, lineStart, lineEnd, columnStart, columnEnd;
	(!end || end < start) && (end = start);

	aryText = text.split('\n');

	aryTmpStart = text.substring(0, start).split('\n');
	lineStart = aryTmpStart.length;
	columnStart = aryTmpStart[lineStart-1].length;

	if ( start < end  ) {
		aryTmpEnd = text.substring(0, end).split('\n');
		lineEnd = aryTmpEnd.length;
		columnEnd= aryTmpEnd[lineEnd-1].length;
	}else{
		lineEnd = lineStart;
		columnEnd = aryText[lineEnd-1].length;
	}

	// 补丁。。。
	while ( !aryText[lineEnd-1].trim() ) {
		lineEnd--;
		columnEnd = aryText[lineEnd-1].length;
	}

	let loc = { start: { line: lineStart, column: columnStart }, end: { line: lineEnd, column: columnEnd} };
	let cf = babelCodeFrame.codeFrameColumns(aryText.slice(0, lineStart + 3).join('\n'), loc, {highlightCode:true});
	return  '------------------------------------------------' + '\n' +
				cf   + '\n' +
			'------------------------------------------------';
}


// 堆栈提示仅有行列
function getCodeframeByFileLineColumn(file, lineNo, col){
	let src, tmp, arySrc, aryTmp, line=lineNo-0, columnFrom=col-0, columnTo;

	src = File.read(file).split('\n').slice(0, line + 3);
	columnTo = src[line-1].length;
	let loc = { start: { line: line, column: columnFrom }, end: { line: line, column: columnTo} };
	let rs = babelCodeFrame.codeFrameColumns(src.join('\n'), loc, {highlightCode:true});
	return 	'------------------------------------------------' + '\n' +
				rs   + '\n' +
			'------------------------------------------------';
}


// 友好错误信息
Err.cat = function(...args){
	let e;
	for ( let i=0,v; v=args[i++]; ) {
		(v instanceof Error) && (e=v);
	}
	if ( !e ) return args.filter(v => v!=null).join('\n'); // 参数没有Error对象

	let ary = args.filter(v => v!=null && v!==e).map(v => (v instanceof Error) ? setCodeframe(v).toString() : v );
	ary.push(setCodeframe(e).toString());
	e.stack = ary.join('\n');

	return e;
};

module.exports = Err;
