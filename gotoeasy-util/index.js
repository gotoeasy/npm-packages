const lodash = require('lodash');
const random = require('number-random');

/**
 * 字符串全部替换
 * <p>
 * 当pattern为普通对象时，按对象键值替换
 *
 * @param {String} str 原字符串
 * @param {String/PlainObject} pattern 待替换内容 （当pattern为普通对象时，按对象键值替换）
 * @param {String} replacement 替换后内容
 * @return 替换结果
 */
function replaceAll(str = '', pattern, replacement) {
	if (arguments.length < 2 ){
		return str;
	}

	let rs = str;
	if (lodash.isPlainObject(pattern)){
		for (let key in pattern){
			rs = rs.replace(new RegExp('{' + key + '}', "gm"), pattern[key])
		}
	}else {
		rs = rs.replace(new RegExp(pattern, "gm"), replacement)
	}

	return rs;
}

/**
 * 判断是否为普通对象
 *
 * @param {any} obj 判断对象
 * @return true/false
 */
function isPlainObject(obj) {
	return lodash.isPlainObject(obj);
}

// 导出接口
let api = {};
api.replaceAll = replaceAll;

/**
 * 字符串全部替换
 * <p>
 * 当pattern为普通对象时，按对象键值替换
 *
 * @param str 原字符串
 * @param pattern 待替换内容 （当pattern为普通对象时，按对象键值替换）
 * @param replacement 替换后内容
 */
api.isPlainObject = isPlainObject;
api.startsWith = lodash.startsWith;
api.random = random;


module.exports = api;