const callbacks = {};

function on(name, fn) {
	callbacks[name.toLowerCase()] || (callbacks[name.toLowerCase()] = fn);
	return callbacks[name.toLowerCase()];
}

function at(name){
	let fn = callbacks[name.toLowerCase()] || (e=>{});
	let args = Array.prototype.slice.call(arguments, 1);
	return fn && fn.apply(this, args);
}

module.exports = { on: on, at: at };
