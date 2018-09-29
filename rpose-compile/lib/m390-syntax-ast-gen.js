const options = require('./m020-options')();
const util = require('./m900-util');

// ------------ Ast代码编译器 ------------
// TODO 优化
class AstGen{
	constructor(ast) {
		this.ast = ast;
	}

	toJavaScript (){
		return this.parseChildren(this.ast);
	}

	parseChildren (astNodes, isFn=true){
		let aryNm = 'v_Array'; // 模板内部变量，尽量避免和自定义代码冲突

		let arySrc = [];
		isFn ? arySrc.push('function template($data, $opts){') : arySrc.push('(()=>{'); // 箭头函数立即执行
		arySrc.push(`let ${aryNm} = [];`);
		for (let i=0, node; i<astNodes.length; i++) {
			node = astNodes[i];

			if (node.type == options.TypeCodeBlock){
				// 代码块，直接用
				arySrc.push( node.src );
			}else if (node.type == options.TypeText || node.type == options.TypeEscapeExpression || node.type == options.TypeUnescapeExpression){
				// 文本块，表达式
				let txt = node.src.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/"/g, '\\"');
				if ( node.type == options.TypeText ) {
					// 文本节点
					arySrc.push( `${aryNm}.push( "${txt}" )` );																// "ssssssssssssssss"
				}else if ( node.type == options.TypeEscapeExpression ) {
					// 待转义表达式
					txt = util.getExpression(txt);
					arySrc.push( `${aryNm}.push( ${txt} );` );									// escapeHtml($data.name)
				}else{
					// 非转义表达式
					arySrc.push( `${aryNm}.push( (${txt}) );` );															// ($data.name)
				}
			}else{
				// 标签节点
				let tag = node.tag;
				let attrs = attrsStringify(node.attrs);

				if ( node.children ) {
					// 含子节点
					let childSrc = this.parseChildren(node.children, false);
					if ( attrs ) {
						arySrc.push( `${aryNm}.push( {t: '${tag}', a: ${attrs}, c: ${childSrc}} );` );						// {t:'div', a:{}, c:[]}
					}else{
						arySrc.push( `${aryNm}.push( {t: '${tag}', c: ${childSrc}} );` );									// {t:'div', c:[]}
					}
				}else{
					// 无子节点
					if ( node.attrs ) {
						// 含属性
						arySrc.push( `${aryNm}.push( {t:'${tag}', a:${attrs}} );` );										// {t:'div', a:{}}
					}else{
						// 无属性
						arySrc.push( `${aryNm}.push( {t:'${tag}'} );` );													// {t:'div'}
					}
				}
			}

		}
		arySrc.push(`return ${aryNm};`);
		isFn? arySrc.push('}') : arySrc.push('})()'); // 箭头函数则立即执行


		// 单节点箭头函数时，简化数组形式输出 [nnn]
		if ( !isFn && arySrc.length == 5) {
			let ary = [];
			let startStr = `${aryNm}.push(`;
			let len = startStr.length;

			for ( let i=0; i<arySrc.length; i++) {
				if ( arySrc[i].startsWith(startStr) ) {
					return '[' + arySrc[i].substring(len, arySrc[i].length-2) + ']';										// [nnnnnnnnnn]
				}
			}

		}

		return arySrc.join('\n');
	}

}


// JSON对象转字符串形式，值含函数调用
function attrsStringify(attrs){
	if ( !attrs ) {
		return 0;
	}

	let rs = [];

	for ( let k in attrs ) {
		rs.push('"' + k + '": ' + getExprString(attrs[k]))
	}

	return '{' + rs.join(',') + '}';
}

function getExprString(val){
	val += '';
	if ( options.ExpressionUnescapeStart.length > options.ExpressionStart.length ) {
		// 长的先匹配
		if ( val.startsWith(options.ExpressionUnescapeStart) && val.endsWith(options.ExpressionUnescapeEnd) ) {
			return options.NameFnUnescapeHtml + '(' + val.substring(options.ExpressionUnescapeStart.length, val.length - options.ExpressionUnescapeEnd.length) + ')';
		}else if ( val.startsWith(options.ExpressionStart) && val.endsWith(options.ExpressionEnd) ) {
			return options.NameFnEscapeHtml + '(' + val.substring(options.ExpressionStart.length, val.length - options.ExpressionEnd.length) + ')';
		}
	}else{
		if ( val.startsWith(options.ExpressionStart) && val.endsWith(options.ExpressionEnd) ) {
			return options.NameFnEscapeHtml + '(' + val.substring(options.ExpressionStart.length, val.length - options.ExpressionEnd.length) + ')';
		}else if ( val.startsWith(options.ExpressionUnescapeStart) && val.endsWith(options.ExpressionUnescapeEnd) ) {
			return options.NameFnUnescapeHtml + '(' + val.substring(options.ExpressionUnescapeStart.length, val.length - options.ExpressionUnescapeEnd.length) + ')';
		}
	}
	return '"' + val.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}


module.exports = AstGen;



/*
【模板例子】
<div>
{% for (let i=0; i<20; i++) { %}
	<span code="{{ $opts.code }}" name="NNN">No.{{i+1}} Input:</span><input type="text" value="{{'value' + i}}"><br>
{% } %}
</div>

// 【编译结果】
function template($data, $opts) {
    let v_Array = [];
    v_Array.push({
        t: "div",
        c: (() => {
            let v_Array = [];
            for (let i = 0; i < 20; i++) {
                v_Array.push({ t: "span", a: { code: escapeHtml($opts.code), name: "NNN" }, c: ["No." + escapeHtml(i + 1) + " Input:"] });
                v_Array.push({ t: "input", a: { type: "text", value: escapeHtml("value" + i) } });
                v_Array.push({ t: "br" });
            }
            return v_Array;
        })()
    });
    return v_Array;
}

*/
