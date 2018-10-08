// HTML标准所定义的全部标签
const REG_TAGS = /^(html|link|meta|style|title|address|article|aside|footer|header|h1|h2|h3|h4|h5|h6|hgroup|main|nav|section|blockquote|dd|dir|div|dl|dt|figcaption|figure|hr|li|ol|p|pre|ul|a|abbr|b|bdi|bdo|br|cite|code|data|dfn|em|i|kbd|mark|q|rb|rp|rt|rtc|ruby|s|samp|small|span|strong|sub|sup|time|tt|u|var|wbr|area|audio|img|map|track|video|applet|embed|iframe|noembed|object|param|picture|source|canvas|noscript|script|del|ins|caption|col|colgroup|table|tbody|td|tfoot|th|thead|tr|button|datalist|fieldset|form|input|label|legend|meter|optgroup|option|output|progress|select|textarea|details|dialog|menu|menuitem|summary|content|element|shadow|slot|template|acronym|basefont|bgsound|big|blink|center|command|font|frame|frameset|image|isindex|keygen|listing|marquee|multicol|nextid|nobr|noframes|plaintext|spacer|strike|xmp|head|base|body|svg|math)$/i
// HTML标准所定义的全部标签事件
const REG_EVENTS = /^(onclick|onchange|onabort|onafterprint|onbeforeprint|onbeforeunload|onblur|oncanplay|oncanplaythrough|oncontextmenu|oncopy|oncut|ondblclick|ondrag|ondragend|ondragenter|ondragleave|ondragover|ondragstart|ondrop|ondurationchange|onemptied|onended|onerror|onfocus|onfocusin|onfocusout|onformchange|onforminput|onhashchange|oninput|oninvalid|onkeydown|onkeypress|onkeyup|onload|onloadeddata|onloadedmetadata|onloadstart|onmousedown|onmouseenter|onmouseleave|onmousemove|onmouseout|onmouseover|onmouseup|onmousewheel|onoffline|ononline|onpagehide|onpageshow|onpaste|onpause|onplay|onplaying|onprogress|onratechange|onreadystatechange|onreset|onresize|onscroll|onsearch|onseeked|onseeking|onselect|onshow|onstalled|onsubmit|onsuspend|ontimeupdate|ontoggle|onunload|onunload|onvolumechange|onwaiting|onwheel)$/i;

const options = require('./m020-options')();
const util = require('./m900-util');
const acorn = require('acorn');
const acornGlobals = require('acorn-globals');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

const FN_TMPL_DEF = 'function nodeTemplate($data, $opts){'; // 模板方法开始行

// ------------ Ast代码编译器 ------------
class AstGen{
	constructor(ast, doc) {
		this.ast = ast;

		this.$dataKeys = getObjectKeys(doc.defaultdata);	// 默认数据对象的源码，如{a:1,b:'2'......}，从中取出key（数组）
		this.$optsKeys = getObjectKeys(doc.defaultprops);	// 默认选项对象的源码，如{a:1,b:'2'......}，从中取出key（数组）
		this.$methodKeys = getObjectKeys(doc.methods);		// 方法对象的源码，如{a:function(){},b:()=>{}......}，从中取出key（数组）
	}

	toJavaScript (){
		let src = this.parseChildren(this.ast);
console.debug(MODULE, src);
		return checkAndInitVars(src, this.$dataKeys, this.$optsKeys);
	}

	parseChildren (astNodes, isFn=true){
		let aryNm = 'v_Array'; // 模板内部变量，尽量避免和自定义代码冲突

		let arySrc = [];
		let hasCodeBlock = false;
		isFn ? arySrc.push(FN_TMPL_DEF) : arySrc.push('(()=>{'); // 函数则【 function nodeTemplate($data, $opts){ 】，箭头函数则立即执行
		arySrc.push(`let ${aryNm} = [];`);
		for (let i=0, node; i<astNodes.length; i++) {
			node = astNodes[i];

			if (node.type == options.TypeCodeBlock){
				// 代码块，直接用
				arySrc.push( node.src );
				hasCodeBlock = true;
			}else if (node.type == options.TypeText || node.type == options.TypeEscapeExpression || node.type == options.TypeUnescapeExpression){
				// 文本块，表达式
				if ( node.type == options.TypeText ) {
					// 文本节点
					let txt = util.lineString(node.src);
					arySrc.push( `${aryNm}.push( "${txt}" )` );																// "ssssssssssssssss"
				}else if ( node.type == options.TypeEscapeExpression ) {
					// 待转义表达式
					let txt = util.getExpression(node.src);
					arySrc.push( `${aryNm}.push( ${txt} );` );									// escapeHtml($data.name)
				}else{
					// 非转义表达式
					let txt = util.getExpression(node.src);
					arySrc.push( `${aryNm}.push( (${txt}) );` );															// ($data.name)
				}
			}else{
				// 标签节点
				let tag = node.tag;
				let isStdTag = REG_TAGS.test(tag);									// 是否标准标签
				let events = getDomEvents(node.attrs, isStdTag, this.$methodKeys);	// 标准标签有事件绑定声明时会修改node.attrs，组件标签不处理
				let attrs = attrsStringify(node.attrs);
				let childSrc = node.children && node.children.length ? this.parseChildren(node.children, false) : null;

				let str = `${aryNm}.push( {t: '${tag}'`;							// 一定有标签名，其他可以没有
				events && (str += `, e: ${events}` );
				attrs && (str += `, a: ${attrs}` );
				childSrc && (str += `, c: ${childSrc}` );
				!isStdTag && (str += `, m: 1` );
				str += `} );`;

				arySrc.push( str );	// {t:'div', a:{...}, c:[...], e:{...}, m: 1}
			}

		}
		arySrc.push(`return ${aryNm};`);
		isFn? arySrc.push('}') : arySrc.push('})()'); // 箭头函数则立即执行


		// 没有代码块的时候，可以简化数组形式输出 [nnn]
		if ( !hasCodeBlock ) {
			let ary = [];
			let startStr = `${aryNm}.push(`;
			let len = startStr.length;

			let str = ''
			for ( let i=0; i<arySrc.length; i++) {
				if ( arySrc[i].startsWith(startStr) ) {
					str && (str += ', ');
					str += arySrc[i].substring(len, arySrc[i].length-2);
				}
			}
			let sReturn = '[' + str + ']';										// [nnnn, nnnn, nn]
			
			if ( isFn ) {
				return FN_TMPL_DEF + ' return ' + sReturn + ';}'; // 'function nodeTemplate($data, $opts){ return ' + sReturn + ';}';
			}else{
				return sReturn; // 内部箭头函数默认返回
			}

		}


		return arySrc.join('\n');
	}

}


// JSON对象转字符串形式，值含函数调用
function attrsStringify(attrs){
	if ( !attrs ) {
		return null;
	}

	let rs = [];

	for ( let k in attrs ) {
		rs.push('"' + k + '": ' + util.getExpression(attrs[k]))
	}

	return '{' + rs.join(',') + '}';
}

// 抽取并删除事件属性，返回事件属性
function getDomEvents(attrs, isStdTag, $methodKeys){
	if ( !isStdTag || !attrs ) {
		return null;
	}

	let rs = [], keys = [];
	for ( let key in attrs ) {
		if ( REG_EVENTS.test(key) ) {
			if ( attrs[key].indexOf('{') < 0 ) {
				// 没有表达式，检查指定方法是否存在
				if ( !$methodKeys.includes(attrs[key].trim()) ) {
					throw new Error('method not found: ' + attrs[key]); // 指定方法找不到，需要定义
				}
			}
			rs.push( '"' + key.substring(2).toLowerCase() + '": ' + util.getExpression(attrs[key]) );
			keys.push(key);
		}
	}

	keys.forEach(k => delete attrs[k]);

	if ( rs.length ) {
		return '{' + rs.join(',') + '}';
	}
	return null;
}

// 检查是否有变量缩写，有则补足。 以支持{$data.abcd}简写为{abcd}
function checkAndInitVars(src, $dataKeys, $optsKeys){
	// 参数添加转义函数进行检查 'function nodeTemplate($data, $opts){' => 'function nodeTemplate($data, $opts, escapeHtml){'
	let tmpFnDef = FN_TMPL_DEF.replace('){', ', ' + options.NameFnEscapeHtml.split('.')[0]) + '){'; // 'function nodeTemplate($data, $opts, escapeHtml){'
	let tmp = src.replace(FN_TMPL_DEF, tmpFnDef);
	let scope = acornGlobals(tmp);
	if ( !scope.length ) {
		return src; // 正常，直接返回
	}

	// 函数内部添加变量声明赋值后返回
	let vars = [];
//	scope.forEach(v => vars.push(`let ${v.name} = $data.${v.name};`));

	for ( let i=0, v; i<scope.length; i++ ) {
		v = scope[i];
		let inc$data = $dataKeys.includes(v.name);
		let inc$opts = $optsKeys.includes(v.name);
		if ( !inc$data && !inc$opts ) {
			throw new Error('template variable undefined: ' + v.name); // 变量无法识别来自$data还是$opts
		}
		if ( inc$data && inc$opts ) {
			throw new Error('template variable uncertainty: ' + v.name); // 变量同时存在于$data和$opts，需指定
		}


		if ( inc$data ) {
			vars.push(`let ${v.name} = $data.${v.name};`)
		}else {
			vars.push(`let ${v.name} = $opts.${v.name};`)
		}
	}

	return FN_TMPL_DEF + vars.join('\n') + src.substring(FN_TMPL_DEF.length);
}

function getObjectKeys(jsonStr){ // jsonStr = {....}
    let ast = acorn.parse('let x = ' + jsonStr);
	let props = ast.body[0].declarations[0].init.properties;
	let keys = [];
	props.forEach(node => keys.push(node.key.name));
	return keys;
}

module.exports = AstGen;


