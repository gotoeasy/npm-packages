const options = require('./m020-options')();

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


// 取表达式代码（删除两边表达式符号）
function getExpression(expr){
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
	return '"' + val.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}



// API
let api = {};
api.isFunction = isFunction;
api.isPlainObject = isPlainObject;
api.isObject = isObject;
api.isString = isString;

api.getExpression = getExpression;


module.exports = api;
