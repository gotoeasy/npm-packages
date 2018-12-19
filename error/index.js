const File = require('@gotoeasy/file');
const babelCodeFrame = require('@babel/code-frame');
const iserror = require('is-error');

// 友好错误对象的信息表示
// 最后一个参数是Error对象，前面参数为要添加的文字信息
// 返回处理后的原最后参数的Error对象
// 最后一个参数不是Error对象时，返回全部参数的拼接结果
module.exports = function error(...args){

	// 没有参数直接返回
	if ( !args.length ) return;

	let e = args.pop();

	// 最后参数不是Error对象，返回全部参数的拼接结果
	if ( !iserror(e) ) return args.push(e).join('\n    ');

	// 只有一个参数而且是已经处理过的Error对象，直接返回该Error对象
	if ( args.length === 1 && e.done ) return e;

	// --------------------------------
	// 加工Error对象的堆栈信息，插入代码位置详细信息，插入参数指定的补足信息
	// --------------------------------
	let stacks = e.stack.split('\n');

	// 从堆栈信息中查找出错文件，堆栈信息格式有所不同需判断处理
	!e.done && stacks[1] && stacks[1].replace(/^\s*at\s?([\s\S]*?)\:(\d+)\:*(\d*)$/, function(match, $file, $line, $col=0){
		if ( File.exists($file) ) {
			let src = File.read($file).split('\n').slice(0, $line-0+3);
			let loc = { start: { line: $line, column: $col }, end: { line: $line, column: src[$line-1].length} };

			let codeInfo = babelCodeFrame.codeFrameColumns(src.join('\n'), loc, {highlightCode:true});
			stacks.unshift(stacks.shift(), codeInfo); // 插入代码位置详细信息
		}
		e.done = true; // 已处理
	});

	!e.done && stacks[1] && stacks[1].replace(/^\s*at\s?[\s\S]*?\(([\s\S]*?)\:(\d+)\:*(\d*)\)$/, function(match, $file, $line, $col=0){
		if ( File.exists($file) ) {
			let src = File.read($file).split('\n').slice(0, $line-0+3);
			let loc = { start: { line: $line, column: $col }, end: { line: $line, column: src[$line-1].length} };

			let codeInfo = babelCodeFrame.codeFrameColumns( src.join('\n'), loc, {highlightCode: true} );
			stacks.unshift(stacks.shift(), codeInfo); // 插入代码位置详细信息
		}
		e.done = true; // 已处理
	});

	stacks.unshift(args.join('\n    ')); // 插入参数指定的补足信息

	e.stack = stacks.join('\n');
	return e;
}
