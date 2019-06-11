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

		let msgs=[], ex, opts1, opts2;
		args.forEach(v => {
			if ( v instanceof Error ) {
				ex = v;
			}else if ( Object.prototype.toString.call(v) === '[object Object]' ) {
				opts1 ? (opts2 = v) : (opts1 = v);
			}else{
				msgs.push(v);
			}
		});

        !opts1 && (opts1 = {});

		msgs.length && (this.message = msgs[0]);		// 第一个字符串参数作为异常的消息
		Object.defineProperty(this, "codeframe", {value : null, writable : true} );

		if ( opts1.text || opts1.file ) {
            if ( !opts2 ) {
                // 单一codeframe，按指定行列或位置设定
                this.codeframe = opts1.line !== undefined ? codeframe({file: opts1.file, text: opts1.text, line: opts1.line, column: opts1.column >>> 0 }) : codeframe({file: opts1.file, text: opts1.text, start: opts1.start, end: opts1.end});
                this.codeframe && msgs.push(this.codeframe);
            }else{
                // 双codeframe，尝试合并处理
                opts1.line !== undefined && (opts1.column = opts1.column >>> 0);
                opts2.line !== undefined && (opts2.column = opts2.column >>> 0);
                this.codeframe = codeframe({...opts1}, {...opts2});
                this.codeframe && msgs.push(this.codeframe);
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
						e.codeframe = codeframe({file, line: Math.max(line-1, 0), column: Math.max(column-1, 0)});
						e.codeframe && (e.stack = e.codeframe + '\n' + e.stack);
					}
				});

				e.codeframe == null && str.replace(/^\s*at\s?[\s\S]*?\(([\s\S]*?)\:(\d+)\:(\d*)\)$/, function(match, file, line, column){	// 【    at *** (file:line:col)】
					if ( File.exists(file) ) { // 格式满足也可能是不存在的内部模块文件，还要继续找
						e.codeframe = codeframe({file, line: Math.max(line-1, 0), column: Math.max(column-1, 0)});
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
