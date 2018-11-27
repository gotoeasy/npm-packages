const File = require('gotoeasy-file');

// es2015
module.exports =  (function(babel, options){

	let ary = __dirname.replace(/\\/g, '/').split('/');
	ary.pop(); // lib
	ary.pop(); // gotoeasy-csjs
	ary.push('babel-preset-es2015');
	let es2015 = ary.join('/'); // 用相对目录找出babel-preset-es2015目录
	if ( !File.exists(es2015) ) {
		es2015 = 'es2015';
	}
	options = {
		presets: [es2015]			// 仅转换语法
	}

	return function(src){
		let rs = babel.transform(src, options);
		return rs.code;
	}

})(require("babel-core"));

