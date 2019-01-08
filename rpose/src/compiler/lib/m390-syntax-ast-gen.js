// HTML标准所定义的全部标签，以及svg相关标签
const REG_TAGS = /^(html|link|meta|style|title|address|article|aside|footer|header|h1|h2|h3|h4|h5|h6|hgroup|main|nav|section|blockquote|dd|dir|div|dl|dt|figcaption|figure|hr|li|ol|p|pre|ul|a|abbr|b|bdi|bdo|br|cite|code|data|dfn|em|i|kbd|mark|q|rb|rp|rt|rtc|ruby|s|samp|small|span|strong|sub|sup|time|tt|u|var|wbr|area|audio|img|map|track|video|applet|embed|iframe|noembed|object|param|picture|source|canvas|noscript|script|del|ins|caption|col|colgroup|table|tbody|td|tfoot|th|thead|tr|button|datalist|fieldset|form|input|label|legend|meter|optgroup|option|output|progress|select|textarea|details|dialog|menu|menuitem|summary|content|element|shadow|slot|template|acronym|basefont|bgsound|big|blink|center|command|font|frame|frameset|image|isindex|keygen|listing|marquee|multicol|nextid|nobr|noframes|plaintext|spacer|strike|xmp|head|base|body|math|svg)$/i
// HTML标准所定义的全部标签事件
const REG_EVENTS = /^(onclick|onchange|onabort|onafterprint|onbeforeprint|onbeforeunload|onblur|oncanplay|oncanplaythrough|oncontextmenu|oncopy|oncut|ondblclick|ondrag|ondragend|ondragenter|ondragleave|ondragover|ondragstart|ondrop|ondurationchange|onemptied|onended|onerror|onfocus|onfocusin|onfocusout|onformchange|onforminput|onhashchange|oninput|oninvalid|onkeydown|onkeypress|onkeyup|onload|onloadeddata|onloadedmetadata|onloadstart|onmousedown|onmouseenter|onmouseleave|onmousemove|onmouseout|onmouseover|onmouseup|onmousewheel|onoffline|ononline|onpagehide|onpageshow|onpaste|onpause|onplay|onplaying|onprogress|onratechange|onreadystatechange|onreset|onresize|onscroll|onsearch|onseeked|onseeking|onselect|onshow|onstalled|onsubmit|onsuspend|ontimeupdate|ontoggle|onunload|onunload|onvolumechange|onwaiting|onwheel)$/i;

const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const Err = require('@gotoeasy/err');
const fs = require('fs');
const acorn = require('acorn');
const acornGlobals = require('acorn-globals');
const options = require('./m020-options')();
const util = require('./m900-util');

const JS_VARS = options.NameFnEscapeHtml.split('.')[0] + 'require,window,assignOptions,rpose,$SLOT,Object,Map,Set,WeakMap,WeakSet,Date,Math,Array,String,Number,JSON,Error,Function,arguments,Boolean,Promise,Proxy,Reflect,RegExp,alert,console,window,document'.split(',');
const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';
const FN_TMPL_DEF = `function nodeTemplate($state, $options, $actions, $this){`; // 模板方法开始行


// ------------ Ast代码编译器 ------------
class AstGen{
	constructor(ast, doc) {
		this.ast = ast;
		this.doc = doc;

		this.$dataKeys = doc.statekeys || [];		// 已解析的statekeys
		this.$optsKeys = doc.optionkeys || [];		// 已解析的optionkeys
		this.$actionsKeys = doc.actionskeys || [];	// 已解析的方法对象属性名名

		this.$counter = 0;

		this.doc.slotnmaes = null;
	}

	toJavaScript (){
		let tagSet = new Set();
		//tagSet.add(this.doc.tag);
		let src = this.parseChildren(this.ast, tagSet);
		this.doc.requires = [...tagSet]; // 本组件所直接依赖的其他组件
//console.info(MODULE, this.doc.tag, JSON.stringify([...tagSet]));
console.debug(MODULE, src);
		return checkAndInitVars(this.doc, src, this.$dataKeys, this.$optsKeys);
	}

	// TODO 自动判断子节点是否需要diff
	parseChildren (astNodes, tagSet, isFn=true, isSVG=false, slotNmaes = []){	// slotNmaes 占位标签名称数组，名称不应重复
		let aryNm = 'v_Array'; // 模板内部变量，尽量避免和自定义代码冲突

		//keys.push('');
		//keys.push('');

		let arySrc = [];
		let hasCodeBlock = false;
		isFn ? arySrc.push(FN_TMPL_DEF) : arySrc.push('(()=>{'); // 函数则【 function nodeTemplate($state, $options){ 】，箭头函数则立即执行
		arySrc.push(`let ${aryNm} = [];`) 
		isFn && arySrc.push('');// arySrc[2]占位替换slot脚本用
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
					arySrc.push( `${aryNm}.push( {s:"${txt}", k: ${++this.$counter}} );` );			// {s:"ssssssss", k:999}
				}else if ( node.type == options.TypeEscapeExpression ) {
					// 待转义表达式
					let txt = util.getExpression(node.src);
					arySrc.push( `${aryNm}.push( {s:${txt}, k: ${++this.$counter}} );` );			// {s:escapeHtml($state.name), k:999}
				}else{
					// 非转义表达式
					let txt = util.getExpression(node.src);
					arySrc.push( `${aryNm}.push( {s:(${txt}), k: ${++this.$counter}} );` );			// {s:($state.name), k:999}
				}

			}else{
				// 标签节点
				let tag = node.tag;
				
				if ( /^slot$/i.test(tag) ) {
					// 占位标签，特殊处理
					let name = node.attrs ? (node.attrs.name || '') : '';			    // name不写默认空白
					!slotNmaes.includes(name) && slotNmaes.push(name);
					//arySrc.push( `slotVnodes_${name} && slotVnodes_${name}.length && ${aryNm}.push( ...slotVnodes_${name} );` );	// 插入参数传入的虚拟占位子节点
					arySrc.push( `${aryNm}.push( ...(slotVnodes_${hash(name)} || []) );` );	// 插入参数传入的虚拟占位子节点
					hasCodeBlock = true;
				}else{
					// 其他标签，正常处理
					let isSvgTag = isSVG || /^svg$/i.test(tag);							// 是否SVG标签或SVG子标签
					let isStdTag = isSvgTag || REG_TAGS.test(tag);						// 是否标准标签
                    if ( /^img$/i.test(tag) ) {
                        let imgname = hashImageName(this.doc.file, node.attrs.src);
                        if ( !imgname ) {
                            throw new Err('image file not found');
                        }
                        node.attrs.src = '%imagepath%' + imgname;
                    }

					let events = getDomEvents(node.attrs, isStdTag, this.$actionsKeys);	// 标准标签有事件绑定声明时会修改node.attrs，组件标签不处理
					let attrs = attrsStringify(node, this.doc);							// 属性全静态时会被增加属性x=1 【需events解析完后再做，不然事件绑定会被当属性继续用】
					let npmPkg = attrs && attrs['npm-pkg'] || '';						// npm包名
					let cnt = ++this.$counter;


					let tagpkg = npmPkg ? (tag + ':' + npmPkg) : tag;					// 标签全名
					!isStdTag && tagSet.add( tagpkg );

					let childSrc = node.children && node.children.length ? this.parseChildren(node.children, tagSet, false, isSvgTag, slotNmaes) : null;

					let str = `${aryNm}.push( {t: '${tag}'`;							// 一定有标签名，其他可以没有
					events && (str += `, e: ${events}` );
					attrs && (str += `, a: ${attrs}` );
					childSrc && (str += `, c: ${childSrc}` );
					isStdTag && node.x && (str += `, x: 1` );							// 用x=1告诉diff，这个标准标签的属性名和属性值都不含表达式，不会动态修改，可忽略比较
					!isStdTag && (str += `, m: 1` );									// 组件标签
					str += `, k: ${cnt}`;												// 标签静态模板单位内唯一，m值不同肯定不同，m值相同不一定相同（多数是循环条件导致）
					isSvgTag && (str += `, g: 1` );										// SVG标签或SVG子标签时加上标记
					str += `} );`;

					arySrc.push( str );	// {t:'div', a:{...}, c:[...], e:{...}, m: 1}
				}
			}

		}


		if ( isFn ) {
//			arySrc.push(`return ${aryNm}`); // 数据可以返回多个节点，但需确保渲染结果最多只有一个节点（会导致diff困难）

			// 模板函数返回值有特殊要求： 单节点且属性m=1、必须有返回值
			arySrc.push(`
				if ( ${aryNm}.length > 1 ) {
					console.warn('invlid tag count');
				}
				return ${aryNm}.length ? ${aryNm}[0] : null;
			`);
		}else{
			// 内部箭头函数直接返回数组
			if ( !/^\sreturn\s/.test(arySrc[arySrc.length-1]) ) {
				// 前面已经有了一个return语句时，通常是模板程序强制插入含return的代码块，这时不再插入return数组的语句。
				// 【最终代码被优化压缩后，是否插入这个return数组的语句，结果都是一样】
				arySrc.push(`return ${aryNm};`);
			}
		}
		isFn? arySrc.push('}') : arySrc.push('})()'); // 箭头函数则立即执行


		// 没有代码块的时候，可以简化数组形式输出 {}/[nnn]
		if ( !hasCodeBlock ) {
			let ary = [];
			let startStr = `${aryNm}.push(`;
			let len = startStr.length;

			// 给条代码语句【v_Array.push(......);】就是一个节点，筛选出节点部分【......】并重新整理简化语句
			let str = ''
			for ( let i=0; i<arySrc.length; i++) {
				if ( arySrc[i].startsWith(startStr) ) {
					if ( isFn && str ) {
						// view模板需要用一个标签包裹，不能有多一个顶部标签
						throw new Err('invlid tag count');
					}
					str && (str += ', ');
					str += arySrc[i].substring(len, arySrc[i].length-2); // ${aryNm}.push(xxxxxxx); => xxxxxxx
				}
			}
			
			if ( isFn ) {
				// 模板函数的顶部节点，加入属性m=1
				let sReturn = '{r:1,' + str.trim().substring(1);					// 组件根节点标记 {r:1, .....}
				// 确保包含取slot的代码
				return FN_TMPL_DEF + genSlotVnodesScript(slotNmaes, this.doc) + ' return ' + sReturn + ';}'; // 'function nodeTemplate($state, $options){ return ' + sReturn + ';}';
			}else{
				let sReturn = '[' + str + ']';										// [nnnn, nnnn, nn]
				return sReturn; // 内部箭头函数默认返回
			}

		}else{
			isFn && (arySrc[2] = genSlotVnodesScript(slotNmaes, this.doc)); // 确保包含取slot的代码
		}


		return arySrc.join('\n');
	}

}

function genSlotVnodesScript(slotNmaes, doc){
	if ( !slotNmaes.length ) return '';

    doc.slotnmaes = slotNmaes; // 保存起来备用?

	let nameSet = new Set();
	let names = [];
	let setnm = [];
	slotNmaes.forEach(name => {
        let varName = `slotVnodes_${hash(name)}`;
		if ( !nameSet.has(varName) ) {
			nameSet.add(varName);
			names.push(varName);
			setnm.push(`vn.a && vn.a.slot !== undefined && (_hasDefinedSlotTemplate = 1);`);
			setnm.push(`vn.a && vn.a.slot === '${name}' && (${varName} = vn.c);`);
		}
	});

	let scripts = [];
	scripts.push('let _hasDefinedSlotTemplate, ' + names.join(',') + ';');		// let _hasDefinedSlotTemplate, slotVnodes_xxx, slotVnodes_yyy, slotVnodes_zzz;
	scripts.push('($state.$SLOT || []).forEach(vn => {');	                    // ($state.$SLOT || []).forEach(vn => {
	scripts.push(setnm.join('\n'));                                             //     ...
	scripts.push('});');                                                        // }); 

    // 仅有一个插槽，待插入模板支持省略定义，全部子节点作为默认模板
    if ( names.length === 1 ) {
	    scripts.push(`!_hasDefinedSlotTemplate && !${names[0]} && (${names[0]} = $state.$SLOT);`);          // !_hasDefinedSlotTemplate && !slotVnodes_xxx && (slotVnodes_xxx = $state.$SLOT);
    }
	return scripts.join('\n');
}

function CUID(){
	//return ((radom(1000,9999) + "" + radom(10000,99999) + "" + radom(100000,999999))-0).toString(36); // 三次随机数（4位5位6位）连成15位数字，转36进制字符串
	return (radom(1000000,9999999) + "" + new Date().getTime().toString().substring(7))-0; // 随机数（7位）和时间数值（6位）连成12位数字
}

function radom(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


// JSON对象转字符串形式，值含函数调用
function attrsStringify(node, doc){
	let attrs = node.attrs;
	if ( !attrs ) {
		node.x = 1;
		return null;
	}

	let kvs = [];
	let objs = [];
	let cls = {};
	let staticAttrs = true;

    // 含ref属性时，自动添加$context属性，避免组件对象上下文混乱，深度slot内的标签含ref属性时特需
    attrs.ref && (attrs.$context = '{=$this}');

	for ( let k in attrs ) {
		if ( (k.startsWith(options.ExpressionStart) && k.endsWith(options.ExpressionEnd)) || (k.startsWith(options.ExpressionUnescapeStart) && k.endsWith(options.ExpressionUnescapeEnd)) ) {
			// 键名是表达式，是个单纯的属性键值对象 <tag {prop} />
			let expr = util.getExpression(k);
			//expr.startsWith('(')
			objs.push(expr.startsWith('(') ? expr : expr.substring(expr.indexOf('('))); // escapeHtml(....) => (....)
			staticAttrs = false;
		}else{
			if ( attrs[k] === true ) {
				// 这是个无值的字符串属性，通常是readonly之类，在m220-syntax-ast中补充赋值的true
				kvs.push('"' + k + '": 1'); // 用1代表true
			}else{
				let ary = [];
				let espAttr = escapeAttrExpr(attrs[k].trim());				// 把【\{】和【\}】替换为两位特殊字符，避免误当表达式解析
				parseExpression(ary, espAttr);								// 解析表达式
				let expr = '(' + unescapeAttrExpr(ary.join(' + ')) + ')';	// 把【\{】和【\}】替换回来

				if ( k == 'class' ) {
					kvs.push('"' + k + '": ' + JSON.stringify(classStrToObject(attrs[k], doc)) );  // class="abc def" => {class:{abc:1, def:1}}
				}else{
					kvs.push('"' + k + '": ' + expr);
				}

				if ( staticAttrs && attrs[k].indexOf(options.ExpressionStart) >=0 || attrs[k].indexOf(options.ExpressionUnescapeStart) >=0 ) {
					staticAttrs = false; // 键值中含表达式
				}
			}
		}
	}

	if ( staticAttrs ) {
		node.x = 1; // 这个节点的属性是静态的，后续可利用这个标记省略比较属性是否有变化
	}

	let rs = '{' + kvs.join(',') + '}';
	if ( objs.length ) {
		rs = `rpose.assign(${rs}, ${objs.join(',')})`;
	}
	return rs;
}

function escapeAttrExpr(val){
	return val.replace(/\\\{/g, '\u0000\u0001').replace(/\\\}/g, '\ufffe\uffff');
}
function unescapeAttrExpr(val){
	return val.replace(/\u0000\u0001/g, '\\{').replace(/\ufffe\uffff/g, '\\}');
}

function parseAttrValExpr(valTxt){
	let exprStarts = [options.ExpressionUnescapeStart, options.ExpressionUnescapeStart]; // 长的放前面
	if ( options.ExpressionUnescapeStart.length >= options.ExpressionStart.length ) {
		exprStarts[1] = options.ExpressionStart;
	}else{
		exprStarts[0] = options.ExpressionStart;
	}
}

function parseExpression(ary, val){
	
	let idx1 = val.indexOf(options.ExpressionStart);
	let idx2 = val.indexOf(options.ExpressionUnescapeStart);
	if ( idx1 < 0 && idx2 < 0 ) {
		ary.push('"' + util.lineString(val) + '"'); // 无表达式
		return;
	}

	let idxEnd, tmp;
	if ( idx1 >= 0 &&  idx2 >= 0 ) {
		if ( idx1 == idx2 ) {
			if ( options.ExpressionUnescapeStart.length >= options.ExpressionStart ) {
				idx1 = -1; // ExpressionStart无效
			}else{
				idx2 = -1; // ExpressionUnescapeStart无效
			}
		}else if ( idx1 < idx2 ) {
			idx2 = -1; // ExpressionUnescapeStart无效
		}else if ( idx2 < idx1 ) {
			idx1 = -1; // ExpressionStart无效
		}
	}

	if ( idx1 >= 0 ) {
		idxEnd = val.indexOf(options.ExpressionEnd);
		if ( idxEnd <= idx1 ) {
			ary.push('"' + util.lineString(val) + '"'); // 无表达式
			return;
		}
		
		tmp = val.substring(idx1, idxEnd + options.ExpressionEnd.length);
		if ( idx1 > 0 ) {
			ary.push('"' + util.lineString(val.substring(0, idx1)) + '"');	// acb{=def}ghi : abc
		}
		ary.push(util.getExpression(tmp));						// acb{=def}ghi : {=def}

		tmp = val.substring(idxEnd + options.ExpressionEnd.length);
		tmp.trim() && parseExpression(ary, tmp);				// acb{=def}ghi : ghi
		return;
	}
	
	if ( idx2 >= 0 ) {
		idxEnd = val.indexOf(options.ExpressionUnescapeEnd);
		if ( idxEnd <= idx2 ) {
			ary.push('"' + util.lineString(val) + '"'); // 无表达式
			return;
		}
		
		tmp = val.substring(idx2, idxEnd + options.ExpressionUnescapeEnd.length);
		if ( idx2 > 0 ) {
			ary.push('"' + util.lineString(val.substring(0, idx2)) + '"');	// acb{def}ghi : abc
		}
		ary.push(util.getExpression(tmp));						// acb{def}ghi : {def}

		tmp = val.substring(idxEnd + options.ExpressionUnescapeEnd.length);
		tmp.trim() && parseExpression(ary, tmp);				// acb{def}ghi : ghi
	}

}


function classStrToObject(clas, doc){
	if ( !clas.trim()) {
		return {};
	}

	let mapping = doc.mapping || {};
	let ary = clas.split(/\s/);
	let rs = {};
	for ( let i=0,cls; i<ary.length; i++) {
		cls = ary[i].trim();
		mapping[cls] && (cls = mapping[cls]);
		rs[cls] = 1;
	}

	return rs;
}

// 抽取并删除事件属性，返回事件属性
function getDomEvents(attrs, isStdTag, $actionsKeys){
	//if ( !isStdTag || !attrs ) {
	if ( !attrs ) {
		return null;
	}

	let rs = [], keys = [];
	for ( let key in attrs ) {
		if ( REG_EVENTS.test(key) ) {
			if ( !attrs[key].trim() ) {
				continue; // 未定义，忽略
			}

			// 字符串形式改成表达式形式 onclick="fnClick" => onclick="{=$actions.fnClick}"
			if ( attrs[key].indexOf('{') < 0 ) {
				// 没有表达式，检查指定方法是否存在
				if ( !$actionsKeys.includes(attrs[key].trim()) ) {
					let msg = 'action not found: ' + attrs[key];			// TODO 定位显示
					throw new Err(msg); // 指定方法找不到，需要定义
				}else{
					attrs[key] = '{=$actions.' + attrs[key].trim() + '}'; // onclick="fnClick" => onclick="{=$actions.fnClick}"
				}
			}

			// 标准标签时，保存事件名
			if ( isStdTag ) {
				// 标准标签的事件名简化去掉on，a{onclick:...}改成 a{click:...}
				rs.push( '"' + key.substring(2).toLowerCase() + '": ' + util.getExpression(attrs[key]) );
				keys.push(key);
			}

		}
	}

	// 标准标签时，从属性中删除，后续另行移到e属性中
	isStdTag && keys.forEach(k => delete attrs[k]);

	if ( rs.length ) {
		return '{' + rs.join(',') + '}';
	}
	return null;
}

// 检查是否有变量缩写，有则补足。 以支持{$state.abcd}简写为{abcd}
// TODO 检查$state、$options为null时是否正确使用参数
function checkAndInitVars(doc, src, $dataKeys, $optsKeys){
	let scope;
	try{
		scope = acornGlobals(src);
		if ( !scope.length ) return src; // 正常，直接返回
	}catch(e){
		throw Err.cat('source syntax error', '\n-----------------', src, '\n-----------------', 'file='+ doc.file, e); // 多数表达式中有语法错误导致
	}

	// 函数内部添加变量声明赋值后返回
	let vars = [];

	for ( let i=0, v; i<scope.length; i++ ) {
		v = scope[i];
		let inc$data = $dataKeys.includes(v.name);
		let inc$opts = $optsKeys.includes(v.name);
		let incJsVars = JS_VARS.includes(v.name);
		if ( !inc$data && !inc$opts && !incJsVars) {
			let msg = 'template variable undefined: ' + v.name;
			throw Err.cat(MODULE + doc.file, $dataKeys, new Err(msg));		// 变量不在$state或$options的属性范围内
		}
		if ( inc$data && inc$opts ) {
			let msg = 'template variable uncertainty: ' + v.name;
			throw Err.cat(MODULE + doc.file, new Err(msg));					// 变量同时存在于$state和$options，无法自动识别来源，需指定
		}


		if ( inc$data ) {
			vars.push(`let ${v.name} = $state.${v.name};`)
		}else if ( inc$opts ) {
			vars.push(`let ${v.name} = $options.${v.name};`)
		}
	}

	return FN_TMPL_DEF + vars.join('\n') + src.substring(FN_TMPL_DEF.length);
}

function hashImageName(srcFile, imgSrc){
    let file;
    if ( File.exists(imgSrc) ) {
        file = imgSrc;
    }else{
        file = File.resolve(srcFile, imgSrc);
        if ( !File.exists(file) ) {
            return false;
        }
    }

    let name = hash({file}) + File.extname(file); // 去除目录，文件名哈希化，后缀名不变

    // TODO 复制文件
	let env = bus.at('编译环境');
    let distDir = env.path.build_dist + '/images';
    let distFile = env.path.build_dist + '/images/' + name;
    if ( !File.exists(distFile) ) {
        !File.existsDir(distDir) && File.mkdir(distDir);
        fs.createReadStream(file).pipe(fs.createWriteStream(distFile));
    }

    return name;
}

/*
function getObjectKeys(jsonStr){ // jsonStr = null 或 {....}
	if ( jsonStr.trim() == 'null' ) {
		return [];
	}

    let ast = acorn.parse('let x = ' + jsonStr);
	let props = ast.body[0].declarations[0].init.properties;
	let keys = [];

	props.forEach(node => keys.push(node.key.name || node.key.value));
	return keys;
}
*/

module.exports = AstGen;


