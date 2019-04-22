const File = require('@gotoeasy/file');
const codeframe = require('@gotoeasy/code-frame');

/*
new Err()
new Err(msg)
new Err(msg1, msg2, msg3)
new Err(msg1, msg2, msg3, opts)
new Err(msg, e)
new Err(msg1, msg2, msg3, e, opts)
*/
class Err extends Error{

	// 参数按类型识别分类，位置基本无关
	// 字符串参数将按顺序拼接，第一个字符串参数作为异常的消息
	constructor(...args) {
		super();

		let msgs=[], ex, opts={};
		args.forEach(v => {
			if ( v instanceof Error ) {
				ex = v;
			}else if ( Object.prototype.toString.call(v) === '[object Object]' ) {
				opts = v;
			}else{
				msgs.push(v);
			}
		});

		msgs.length && (this.message = msgs[0]);		// 第一个字符串参数作为异常的消息
		Object.defineProperty(this, "codeframe", {value : null, writable : true} );

		if ( opts.text || opts.file ) {
			// 按指定行列或位置设定codeframe
			this.codeframe = opts.line ? codeframe({file: opts.file, text: opts.text, line: opts.line, column: opts.column >>> 0 }) : codeframe({file: opts.file, text: opts.text, start: opts.start, end: opts.end});
            if ( this.codeframe ) {
                if ( opts.file ) {
                    msgs.push('file = ' + opts.file);
                }
                msgs.push(this.codeframe);
            }
		}else{
			// 按自身异常抛出位置设定codeframe
			setCodeframe(this);
		}

		msgs.push(this.stack);
		ex && msgs.push(ex.stack);
		this.stack = msgs.join('\n');
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
		let stacks = (e.stack || '').split('\n');
		for ( let i=0,str; str=stacks[i++]; ) {
			if ( /\:\d+\:\d+/.test(str) ) {
				// 从堆栈信息中查找出错文件，堆栈信息格式有所不同需判断处理
				e.codeframe == null && str.replace(/^\s*at\s?([\s\S]*?)\:(\d+)\:(\d*)$/, function(match, file, line, column){				// 【    at file:line:col】
					if ( File.exists(file) ) { // 格式满足也可能是不存在的内部模块文件，还要继续找
						e.codeframe = codeframe({file, line, column});
						e.codeframe && (e.stack = e.codeframe + '\n' + e.stack);
					}
				});

				e.codeframe == null && str.replace(/^\s*at\s?[\s\S]*?\(([\s\S]*?)\:(\d+)\:(\d*)\)$/, function(match, file, line, column){	// 【    at *** (file:line:col)】
					if ( File.exists(file) ) { // 格式满足也可能是不存在的内部模块文件，还要继续找
                        line = line - 1;
                        column = column - 1;
						e.codeframe = codeframe({file, line, column});
						e.codeframe && (e.stack = e.codeframe + '\n' + e.stack);
					}
				});

				if ( e.codeframe ) {
					break;
				}
			}
		}
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

	let ary = args.filter(v => v!=null && v!==e).map(v => (v instanceof Error) ? v.stack : v );
	ary.push(setCodeframe(e).toString());
	e.stack = ary.join('\n');

	return e;
};

module.exports = Err;
