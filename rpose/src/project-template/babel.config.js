const presets = [

	// 目标浏览器统一参照.browserslistrc查找
	['@babel/env', {
		useBuiltIns: 'usage',		// usage, entry, false
	}],

];

module.exports = { presets };

