// ---------------------------
// 简易事件
// ---------------------------
const callbacks = {}; // key:set(fn)

function on(name, fn) {
	if (typeof fn == 'function') {
		let key = name.toLowerCase().trim();
		let fnSet = callbacks[key] || (callbacks[key] = new Set());
		fnSet.add(fn);
	}
	return fn;
}

// 同步调用事件函数，返回第一个函数的处理结果，没有相应函数时返回undefined
function at(name){
	let key = name.toLowerCase().trim();
	if ( callbacks[key] ) {
		let fnSet = callbacks[key] || (callbacks[key] = new Set());
		let args = Array.prototype.slice.call(arguments, 1);
		let rsFirst, isFirst = true;
		fnSet.forEach(fn => {
			if ( isFirst ) {
				rsFirst = fn.apply(this, args);
				isFirst = false;
			}
		});

		return rsFirst;
	}
}

module.exports = { on: on, at: at };
