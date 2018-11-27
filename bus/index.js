// ---------------------------
// 简易总线
// ---------------------------
function Bus(){

	const map = new Map(); // key:set[fn]

	// 安装事件函数
	const on = (key, fn) => {
		if (typeof fn == 'function') {
			let setFn; 
			if ( map.has(key) ) {
				setFn = map.get(key);
			}else{
				setFn = new Set();
				map.set(key, setFn);
			}
			setFn.add(fn);
		}
		return fn;
	};

	// 卸载事件函数
	const off = (key, fn) => {
		if ( !map.has(key) ) return;

		if ( !fn ) {
			map.delete(key);
			return;
		}

		map.get(key).delete(fn);
	};

	// 安装事件函数，函数仅执行一次
	const once = (key, fn) => {
		fn["ONCE_" + key] = 1; // 加上标记
		on(key, fn);
	};

	// 通知执行事件函数，返回首个函数的处理结果
	const at = (key, ...args) => {
		if ( !map.has(key) ) return;

		let rs, setFn = map.get(key), isFirst = true;
		if (setFn.size) {
			setFn.forEach(fn => {
				fn["ONCE_" + key] && setFn.delete(fn) && delete fn["ONCE_" + key]; // 若是仅执行一次的函数则删除关联
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

	// 清除
	const clear = () => map.clear();

	
	// ------------- 对象方法 ------------
	this.on = on;
	this.off = off;
	this.once = once;
	this.at = at;
	this.clear = clear;
}

module.exports = new Bus();
