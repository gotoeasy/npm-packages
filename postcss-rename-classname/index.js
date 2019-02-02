
const postcss = require('postcss');
const BREAKS = '#, +>:\r\n\t[()';

// ---------------------------------------------------
// 一个CSS改类名的postcss插件
// 仅仅针对选择器中的类名，且插件本身并不做类名修改
// 类名如何修改由options选项中传入rename函数进行处理
// 转换后的类名映射存放于result.mapping中供使用
// ---------------------------------------------------
module.exports = postcss.plugin('postcss-rename-classname', function (options={}) {

	let rename = options.rename || (n=>n);

    // 传入配置相关的代码
    return function (root, result) {
		
		let mapping = {};

		// 遍历所有规则
		root.walkRules(rule => {
			let selector = rule.selector;

			// 不含类名则忽略不用处理
			if ( selector.indexOf('.') < 0 ) return;

			// 转成数组，每个类名都将单独在数组某元素中
			let ary = getSelectors(selector);

			// 转换类名（数组元素以点‘.’开始的就是一个类名）
			for ( let i=0,newName; i<ary.length; i++ ) {
				if ( ary[i].startsWith('.') ) {
					newName = rename(ary[i].substring(1));
					mapping[ary[i].substring(1)] = newName;
					ary[i] = '.' + newName;  // 这就是转换了
				}
			}

			// 拼接为转换后的选择器，效果应该是类名被替换了
			rule.selector = ary.join('');
		})

		// 输出转换后的类名映射供使用
		result.mapping = mapping;

    };

});


// 简化，不考虑属性选择器中包含特殊字符‘.’的情况，不考虑转义的情况
function getSelectors(selector){

	let ary = [];
	for ( let i=0,isCls=false,tmp='',len=selector.length,ch; i<len; i++ ) {
		ch = selector.charAt(i);
		if ( ch == '.' ) {
			// 类名开始，已有串即使空白，都直接推入数组
			ary.push(tmp);
			tmp = ch;
			isCls = true;	// 当前是类名
		}else{
			if ( BREAKS.indexOf(ch) >= 0 ) {
				// 选择器分隔字符
				if ( isCls ) {
					// 之前是类名，推入数组
					ary.push(tmp);
					tmp = ch;
					isCls = false; // 当前不是类名了
				}else{
					// 之前不是类名，继续拼接
					tmp += ch;
				}
			}else{
				// 不是分隔字符，继续拼接
				tmp += ch;
			}
		}

		if ( i == len-1 ) {
			// 最后一位，已有串即使空白，都直接推入数组
			ary.push(tmp);
		}
	}

	return ary.filter(v => v !== ''); // 过滤去除纯粹的空串
}