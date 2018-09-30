const options = require('./m020-options')();

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

function isFunction(obj){ 
	return (typeof obj == 'function') && obj.constructor == Function; 
}


function isPlainObject(obj) {
	return toString.call(obj) === '[object Object]';
}

function isObject(obj) {
	return obj !== null && typeof obj === 'object';
}


function isString(obj) {
	return typeof obj === 'string';
}

function isArray(ary) {
	return Array.isArray(ary) || ary instanceof Array 
}

function lineString(str, quote = '"') {
	if ( str == null ) {
		return str;
	}

	let rs = str.replace(/\\/g, '\\\\').replace(/\r/g, '\\r').replace(/\n/g, '\\n')
	if ( quote == '"' ) {
		rs = rs.replace(/"/g, '\\"');
	}else if ( quote == "'" ) {
		rs = rs.replace(/'/g, "\\'");
	}
	return rs;
}

// 取表达式代码（删除两边表达式符号）
function getExpression(expr){
//console.debug(MODULE, expr)
	let val = (expr + '').trim();
	if ( options.ExpressionUnescapeStart.length > options.ExpressionStart.length ) {
		// 长的先匹配
		if ( val.startsWith(options.ExpressionUnescapeStart) && val.endsWith(options.ExpressionUnescapeEnd) ) {
			return '(' + val.substring(options.ExpressionUnescapeStart.length, val.length - options.ExpressionUnescapeEnd.length) + ')';
		}else if ( val.startsWith(options.ExpressionStart) && val.endsWith(options.ExpressionEnd) ) {
			return options.NameFnEscapeHtml + '(' + val.substring(options.ExpressionStart.length, val.length - options.ExpressionEnd.length) + ')';
		}
	}else{
		if ( val.startsWith(options.ExpressionStart) && val.endsWith(options.ExpressionEnd) ) {
			return options.NameFnEscapeHtml + '(' + val.substring(options.ExpressionStart.length, val.length - options.ExpressionEnd.length) + ')';
		}else if ( val.startsWith(options.ExpressionUnescapeStart) && val.endsWith(options.ExpressionUnescapeEnd) ) {
			return '(' + val.substring(options.ExpressionUnescapeStart.length, val.length - options.ExpressionUnescapeEnd.length) + ')';
		}
	}
	return '"' + lineString(val) + '"';
}



// API
let api = {};
api.isFunction = isFunction;
api.isPlainObject = isPlainObject;
api.isObject = isObject;
api.isString = isString;
api.lineString = lineString;

api.getExpression = getExpression;


module.exports = api;
