// ---------------------------
// 简易事件总线
// ---------------------------
function fnBus(){
	if ( fnBus.rs ) {
		return fnBus.rs;
	}

	let keySetFn = {}; // key:Set{fn}

	// 小写去两边空白
	const toLowerCaseTrim = key => key.toLowerCase().trim();

	// 安装事件函数
	const on = (key, fn) => {
		if (typeof fn == 'function') {
			(keySetFn[toLowerCaseTrim(key)] || (keySetFn[toLowerCaseTrim(key)] = new Set())).add(fn);
		}
		return fn;
	};

	// 卸载事件函数
	const off = (key, fn) => {
		let setFn = keySetFn[toLowerCaseTrim(key)];
		setFn && (fn ? setFn.delete(fn) : delete keySetFn[toLowerCaseTrim(key)]);
	};

	// 安装事件函数，函数仅执行一次
	const once = (key, fn) => {
		fn["ONCE_" + toLowerCaseTrim(key)] = 1; // 加上标记
		on(key, fn);
	};

	// 通知执行事件函数
	const at = (key, ...args) => {
		let rs, setFn = keySetFn[toLowerCaseTrim(key)], isFirst = true;
		if (setFn) {
			setFn.forEach(fn => {
				fn["ONCE_" + toLowerCaseTrim(key)] && setFn.delete(fn) && delete fn["ONCE_" + toLowerCaseTrim(key)]; // 若是仅执行一次的函数则删除关联
				if ( isFirst ) {
					rs = fn(...args); // 常用于单个函数的调用，多个函数时返回的是最后一个函数的执行结果
					isFirst = false;
				}else{
					fn(...args);
				}
			});
			!setFn.size && off(key);
		}
		return rs;
	};

	return (fnBus.rs = { on: on, off: off, once: once, at: at });
}


module.exports = fnBus();
