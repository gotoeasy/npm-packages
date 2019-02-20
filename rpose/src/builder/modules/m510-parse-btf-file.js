const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const PTask = require('@gotoeasy/p-task');
const Btf = require('@gotoeasy/btf');
const hash = require('@gotoeasy/hash');
const acorn = require('acorn');
const astring = require('astring');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('解析源文件', function(){

	return function (file) {
        let cache = bus.at('缓存', 'parse-btf');      // 指定名的缓存对象

        let oResult = cache.get(file);
        let oSrc = bus.at('源文件内容', file);
        if ( oResult && oResult.hashcode === oSrc.hashcode ) {     // TODO 考虑配置因素
            return oResult;
        }

        oResult = Object.assign( parseBtf(file, oSrc.text), {hashcode: oSrc.hashcode} );     // 解析

        cache.put(file, oResult);                   // 更新缓存
        return oResult;
	};

}());

function parseBtf(file, src){
    let btf = new Btf(src, true);

    let doc = btf.getDocument();
    doc.file = file;

    let rs = /^\[view\].*\r?\n?|\n\[view\].*\r?\n?/i.exec(src);
    doc.posView = rs ? (rs.index + rs[0].length) : 0;
    rs = /^\[actions\].*\r?\n?|\n\[actions\].*\r?\n?/i.exec(src);
    doc.posActions = rs ? (rs.index + rs[0].length) : 0;
    rs = /^\[methods\].*\r?\n?|\n\[methods\].*\r?\n?/i.exec(src);
    doc.posMethods = rs ? (rs.index + rs[0].length) : 0;
    rs = /^\[css\].*\r?\n?|\n\[css\].*\r?\n?/i.exec(src);
    doc.posCss = rs ? (rs.index + rs[0].length) : 0;
    rs = /^\[less\].*\r?\n?|\n\[less\].*\r?\n?/i.exec(src);
    doc.posLess = rs ? (rs.index + rs[0].length) : 0;
    rs = /^\[scss\].*\r?\n?|\n\[scss\].*\r?\n?/i.exec(src);
    doc.posSass = rs ? (rs.index + rs[0].length) : 0;

    editBtfDocument(doc, file, src);


    let api, view, options, state, actions, methods, css, less, scss, mount, tag, tagpkg, rposepkg, optionkeys, statekeys, actionskeys, methodskeys, prerender, $componentName, _hash, csslib;
    api = doc.api;
    view = doc.view;
    options = doc.options;
    state = doc.state;
    actions = doc.actions;
    methods = doc.methods;
    css = doc.css;
    less = doc.less;
    scss = doc.scss;
    mount = doc.mount;
    tag = doc.tag;
    tagpkg = doc.tagpkg;
    rposepkg = doc.rposepkg;
    optionkeys = doc.optionkeys;
    statekeys = doc.statekeys;
    actionskeys = doc.actionskeys;
    methodskeys = doc.methodskeys;
    prerender = doc.prerender;
    $componentName = doc.$componentName;
    csslib = doc.csslib;

    // 样式库导入
    if ( csslib ) {
        let map = btf.getMap('csslib');
        map.forEach( (v, k) => {
            let pkg = k;
            let imps = v.split('//')[0].trim();
            bus.at('样式库', pkg, imps);
        });
    }

    _hash = hash(src);
    return {file, api, view, options, state, actions, methods, css, less, scss, mount, tag, tagpkg, rposepkg, optionkeys, statekeys, actionskeys, methodskeys, prerender, $componentName, _hash, csslib};
}


function editBtfDocument(doc, file, fileContent){

	// 注意块名为小写，编辑后的数据对象将作为模板数据对象直接传给代码模板
	doc.view			= (doc.getText('view') || '');
	doc.options			= (doc.getText('options') || '').trim() || '{}';
	doc.state			= (doc.getText('state') || '').trim() || '{}';
	doc.actions			= (doc.getText('actions') || '').trim() || '{}';
	doc.methods			= (doc.getText('methods') || '').trim() || '{}';
	doc.css				= (doc.getText('css') || '').trim();
	doc.less			= (doc.getText('less') || '').trim();
	doc.scss			= (doc.getText('scss') || '').trim();
	doc.mount			= (doc.getText('mount') || '').trim();
	doc.csslib			= (doc.getText('csslib') || '').trim();

	let oActions		= generateActions2(doc, fileContent);
	let oMethods		= generateMethods(doc, fileContent);
	doc.actions			= oActions.src;
	doc.methods			= oMethods.src;

	// API块特殊处理
	let oApi			= getApiObject( doc.getMap('api') );
//	oApi.rposepkg		= oApi.rposepkg || oApi['rpose-pkg'];
	oApi.optionkeys		= oApi.optionkeys || oApi['option-keys'];
	oApi.statekeys		= oApi.statekeys || oApi['state-keys'];
	oApi.prerender		= oApi.prerender || oApi['pre-render'] || '';

	doc.tag				= bus.at('默认标签名', file);					// 没有指定tag时按文件名取默认标签名
	doc.rposepkg		= oApi.rposepkg;								// 包名
	doc.optionkeys		= parseKeys(oApi.optionkeys);					// 可配置KEY
	doc.statekeys		= parseKeys(oApi.statekeys);					// 可变更KEY
	doc.actionskeys		= oActions.names;								// 事件KEY
	doc.methodskeys		= oMethods.names;								// 方法KEY
	doc.prerender		= oApi.prerender						        // 预渲染类型

    //doc.singleton		= toBoolean(oApi.singleton)						// 单例组件

	doc.$componentName	= bus.at('组件类名', file);		                // 组件类名
    doc.tagpkg			= bus.at('标签全名', file);
	return doc;
}

// 去注释、Trim处理
function getApiObject(map){
	let rs = {};
	map.forEach((v,k) => {
		let idx = v.indexOf('//');
		idx >= 0 ? (rs[k] = v.substring(0, idx).trim()) : (rs[k] = v.trim()); // val去注释, Trim处理
	});
	return rs;
}

function parseKeys(str){
	if ( str == null ) {
		return null;
	}
	
	// key之间可以逗号、冒号、空格分隔
	let keys = str.replace(/[,;]/g, ' ').split(/\s/).map(v => v.trim()).filter(v => v != '');
	return [...new Set(keys)];
}

// 直接运算为false则返回false，字符串（不区分大小写）‘0’、‘f’、‘false’、‘n’、‘no’ 都为false，其他为true
function toBoolean(arg){
	if ( !arg ) return false;
	if ( typeof arg !== 'string' ) return true;
	return !/^(0|false|f|no|n)$/i.test((arg + '').trim());
}

function generateActions2(doc, text){
	if ( doc.actions.startsWith('{') ) {
		return generateActions(doc, text);
	}

	let code = doc.actions;
	let ast;
	try{
		ast = acorn.parse(code, {ecmaVersion: 10, sourceType: 'module', locations: false} );
	}catch(e){
		// 通常是代码有语法错误
		let start = doc.posActions + e.pos + 1;
		throw new Err('syntax error in [actions] - ' + e.message, doc.file, {text, start});
	}

	let map = new Map();

	ast.body.forEach(node => {
		let nd;
		if ( node.type == 'FunctionDeclaration' ) {
			node.type = 'ArrowFunctionExpression';
			map.set(node.id.name, astring.generate(node));
		}else if ( node.type == 'VariableDeclaration' ) {
			nd = node.declarations[0].init;
			if ( nd.type == 'FunctionDeclaration' || nd.type == 'ArrowFunctionExpression' ) {
				nd.type = 'ArrowFunctionExpression';
				map.set(node.declarations[0].id.name, astring.generate(nd));
			}
		}else if ( node.type == 'ExpressionStatement' ) {
			nd = node.expression.right;
			if ( nd.type == 'FunctionDeclaration' || nd.type == 'ArrowFunctionExpression' ) {
				nd.type = 'ArrowFunctionExpression';
				map.set(node.expression.left.name, astring.generate(nd));
			}
		}
	});

	let names = [...map.keys()];
	let rs = {src:'', names: names};
	if ( names.length ) {
	//	names.sort();

		let ary = [];
		ary.push('this.$actions = {');
		names.forEach(k => {
			ary.push('"' + k + '": ' + map.get(k) + ',');
		});
		ary.push('}');
		
		rs.src = ary.join('\n');
	}

	return rs;
}

function generateActions(doc, text){
	let code = `this.$actions     = ${doc.actions}`;
	let ast;

	try{
		ast = acorn.parse(code, {ecmaVersion: 10, sourceType: 'module', locations: false} );
	}catch(e){
		// 通常是代码有语法错误
		let start = doc.posActions + e.pos - 20;
		throw new Err('syntax error in [actions] - ' + e.message, doc.file, {text, start});
	}

	let names = [];
	let properties = ast.body[0].expression.right.properties;
	properties && properties.forEach(node => {
		if ( node.value.type == 'ArrowFunctionExpression' ) {
			names.push(node.key.name);
		}else if ( node.value.type == 'FunctionExpression' ) {
			// 为了让this安全的指向当前组件对象，把普通函数转换为箭头函数，同时也可避免写那无聊的bind(this)
			let arrNode = node.value;
			arrNode.type = 'ArrowFunctionExpression';
			names.push(node.key.name);
		}
	});

	let rs = {src:'', names: names};
	if ( names.length ) {
		names.sort();
		rs.src = astring.generate(ast);
	}

	return rs;
}

// 把对象形式汇总的方法转换成组件对象的一个个方法，同时都直接改成箭头函数（即使function也不确认this，让this指向组件对象）
function generateMethods(doc, text){
	let code = `oFn               = ${doc.methods}`;
	let ast;
	try{
		ast = acorn.parse(code, {ecmaVersion: 10, sourceType: 'module', locations: false} );
	}catch(e){
		// 通常是代码有语法错误
		let start = doc.posMethods + e.pos - 20;
		throw new Err('syntax error in [methods]', doc.file, {text, start}, e);
	}

	let map = new Map();

	let properties = ast.body[0].expression.right.properties;
	properties && properties.forEach(node => {
		if ( node.value.type == 'ArrowFunctionExpression' ) {
			map.set(node.key.name, 'this.' + node.key.name + '=' + astring.generate(node.value))
		}else if ( node.value.type == 'FunctionExpression' ) {
			// 为了让this安全的指向当前组件对象，把普通函数转换为箭头函数，同时也可避免写那无聊的bind(this)
			let arrNode = node.value;
			arrNode.type = 'ArrowFunctionExpression';
			map.set(node.key.name, 'this.' + node.key.name + '=' + astring.generate(arrNode))
		}
	});

	let names = [...map.keys()];
	names.sort();

	let rs = {src:'', names: names};
	names.forEach(k => rs.src += (map.get(k)+'\n'));
	return rs;
}
