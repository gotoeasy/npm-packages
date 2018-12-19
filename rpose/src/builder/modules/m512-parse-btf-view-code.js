const error = require('@gotoeasy/error');
const bus = require('@gotoeasy/bus');

module.exports = bus.on('转换VIEW中代码块', function(){

	// 代码转义，避免代码块中包含标签等影响解析
	return function (view) {

		view = view.replace(/(<ui-highlight[^>]*>)(\s*<code[^>]*>)?([\s\S]*?)(<\/code>\s*)?(<\/ui-highlight>)/ig,
			function(match, highlightOpen, codeOpen='', code, codeClose='', highlightClose){
			if ( !codeOpen || !codeClose ) {
				// 没有code开始标签或code闭合标签时，按省略写slot标签处理，自动插入
				return highlightOpen + '<code slot="code">' + escape(codeOpen + code + codeClose) + '</code>' + highlightClose;
			}else{
				return highlightOpen + codeOpen + escape(code) + codeClose + highlightClose;
			}
		});

		// 支持md方式代码块写法，自动转换为<ui-highlight>形式
		view = view.replace(/(^```|\n```)(\S*)([\s\S]*?)(\n```\S*)/ig, function(match, $1, lang, code, $4){
			return '<ui-highlight lang="' + escape(lang) + '"><code slot="code">' + escape(code) + '</code></ui-highlight>'
		});

		return view;
	}
}());

// 转义处理，语法高亮组件中应做反向转义取得原内容
function escape(code){
	return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}