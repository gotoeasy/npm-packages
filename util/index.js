// ---------------------------
// 常用工具类封装
// ---------------------------

const api = {};

const _toString = obj => Object.prototype.toString.call(obj);

api.isFunction = obj => (typeof obj == 'function') && obj.constructor == Function;
api.isBoolean = str => typeof str === 'boolean';
api.isNumber = str => typeof str === 'number';
api.isString = str => typeof str === 'string';
api.isObject = obj => obj !== null && typeof str === 'object';
api.isArray = obj => Array.isArray(obj) || obj instanceof Array;
api.isPlainObject = obj => _toString(obj) === '[object Object]';
api.isDate = obj => _toString(obj) === '[object Date]';
api.isRegExp = obj => _toString(obj) === '[object RegExp]';
api.isMap = obj => _toString(obj) === '[object Map]';
api.isSet = obj => _toString(obj) === '[object Set]';

api.isEmpty = obj => {
	if ( !obj ) return true;

	if ( api.isArray(obj) ) {
		return !!obj.length;
	}

	if ( api.isPlainObject(obj) ) {
		for ( let k in obj) {
			return false;
		}
		return true;
	}

	if ( api.isMap(obj) || api.isSet(obj) ) {
		return !!obj.size;
	}

	return false;
}
api.isNotEmpty = obj => !api.isEmpty(obj);



module.exports = api;
