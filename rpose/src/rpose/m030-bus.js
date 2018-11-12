// ---------------------------
// 总线
// ---------------------------
const BUS = (()=>{
	let keySetFn = {}; // key:Set{fn}

	// 安装事件函数
	let on = (key, fn) => (keySetFn[toLowerCase(key)] || (keySetFn[toLowerCase(key)] = new Set())).add(fn);

	// 卸载事件函数
	let off = (key, fn) => {
		let setFn = keySetFn[toLowerCase(key)];
		setFn && (fn ? setFn.delete(fn) : delete keySetFn[toLowerCase(key)]);
	};

	// 安装事件函数，函数仅执行一次
	let once = (key, fn) => {
		fn['ONCE_' + toLowerCase(key)] = 1; // 加上标记
		on(key, fn);
	};

	// 通知执行事件函数
	let at = (key, ...args) => {
		let rs, setFn = keySetFn[toLowerCase(key)];
		if ( setFn ) {
			setFn.forEach(fn => {
				fn['ONCE_' + toLowerCase(key)] && setFn.delete(fn) && delete fn['ONCE_' + toLowerCase(key)]; // 若是仅执行一次的函数则删除关联
				rs=fn(...args); // 常用于单个函数的调用，多个函数时返回的是最后一个函数的执行结果
			});
			!setFn.size && off(key);
		}
		return rs;
	};

	// 安装些默认事件处理
	window.onload = e => at('window.onload', e) > (window.onload = null); // 关闭loader可用


	return {on: on, off: off, once: once, at: at};
})();
