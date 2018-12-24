const File = require('@gotoeasy/file');
const codeframe = require('@gotoeasy/code-frame');

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
				this.codeframe = codeframe(text, start, end);
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
						e.codeframe = codeframe($file, $line, $col);
						e.stack = e.codeframe + '\n' + e.stack;
					}
				});

				e.codeframe == null && str.replace(/^\s*at\s?[\s\S]*?\(([\s\S]*?)\:(\d+)\:*(\d*)\)$/, function(match, $file, $line, $col){	// 【    at *** (file:line:col)】
					if ( File.exists($file) ) {
						e.codeframe = codeframe($file, $line, $col);
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
