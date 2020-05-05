// ----------------------------------------------
// babel转译处理
//   -- 语法转义
//   -- 按需添加补丁
//
// 使用固定配置解决以上两点特定需求
// 目标浏览器通常通过.browserslistrc找得，不特定
// ----------------------------------------------
const options = {
	cwd: __dirname,						// 让babel在当前node_modules中查找依赖模块，避免全局安装时本地却找不到
	compact: false,                     // 避免此警告 【The code generator has deoptimised the styling of undefined as it exceeds the max of 500KB.】
	presets: [
		['@babel/env', {
			useBuiltIns: 'usage',		// 按需添加兼容补丁
            corejs: 'core-js@3'         // core-js@3
		}],
	]
};

// 选项的cwd和presets使用固定配置，不支持修改
module.exports = function(code, opts={}){
	if ( !code ) {
		return code;
	}

	try{
		let rs = require('@babel/core').transformSync(code, Object.assign({}, opts, options));
		return rs.code;
	}catch(e){
		console.error('[@gotoeasy/babel] babel transform failed');
		throw e;
	}
}