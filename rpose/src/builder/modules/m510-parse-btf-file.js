const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const PTask = require('@gotoeasy/p-task');
const Btf = require('@gotoeasy/btf');
const acorn = require('acorn');
const astring = require('astring');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('解析源文件', function(){

	let ptask = new PTask((resolve, reject, isBroken) => async function(btfFile){

		try{
			let text = await bus.at('异步读文件', btfFile);
			if ( text === undefined ) {
				reject(MODULE + 'file not found: ' + btfFile);
				return;
			}
			let btf = new Btf(text, true);

			let doc = btf.getDocument();
			doc.file = btfFile;

			let rs = /^\[view\].*\r?\n?|\n\[view\].*\r?\n?/i.exec(text);
			doc.posView = rs ? (rs.index + rs[0].length) : 0;
			rs = /^\[actions\].*\r?\n?|\n\[actions\].*\r?\n?/i.exec(text);
			doc.posActions = rs ? (rs.index + rs[0].length) : 0;
			rs = /^\[methods\].*\r?\n?|\n\[methods\].*\r?\n?/i.exec(text);
			doc.posMethods = rs ? (rs.index + rs[0].length) : 0;
			rs = /^\[css\].*\r?\n?|\n\[css\].*\r?\n?/i.exec(text);
			doc.posCss = rs ? (rs.index + rs[0].length) : 0;
			rs = /^\[less\].*\r?\n?|\n\[less\].*\r?\n?/i.exec(text);
			doc.posLess = rs ? (rs.index + rs[0].length) : 0;
			rs = /^\[scss\].*\r?\n?|\n\[scss\].*\r?\n?/i.exec(text);
			doc.posSass = rs ? (rs.index + rs[0].length) : 0;

			editBtfDocument(doc, btfFile, text);

			resolve( btf );
		}catch(e){
			reject(Err.cat(MODULE + 'parse btf failed', btfFile, e));
		}
	});


	return function (btfFile, restart=false) {
		return restart ? ptask.restart(btfFile) : ptask.start(btfFile)
	};

}());


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

	let oActions		= generateActions2(doc, fileContent);
	let oMethods		= generateMethods(doc, fileContent);
	doc.actions			= oActions.src;
	doc.methods			= oMethods.src;

	// API块特殊处理
	let oApi			= getApiObject( doc.getMap('api') );
	oApi.rposepkg		= oApi.rposepkg || oApi['rpose-pkg'];
	oApi.optionkeys		= oApi.optionkeys || oApi['option-keys'];
	oApi.statekeys		= oApi.statekeys || oApi['state-keys'];

	doc.tag				= bus.at('默认标签名', file);					// 没有指定tag时按文件名取默认标签名
	doc.rposepkg		= oApi.rposepkg;								// 包名
	doc.optionkeys		= parseKeys(oApi.optionkeys);					// 可配置KEY
	doc.statekeys		= parseKeys(oApi.statekeys);					// 可变更KEY
	doc.actionskeys		= oActions.names;								// 事件KEY
	doc.methodskeys		= oMethods.names;								// 方法KEY
	doc.singleton		= toBoolean(oApi.singleton)						// 单例组件

	doc.$componentName	= bus.at('组件类名', doc.tag, doc.rposepkg);		// 组件类名
	doc.tagpkg			= bus.at('标签全名', doc.tag, doc.rposepkg);

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

function hasHighlightCode(view){
	let idx = view.indexOf('\n```');
	if ( idx < 0 ) return false;

	if ( view.startsWith('```') ) {
		return true;	// 由```起始，且有结束行
	}
	return view.indexOf('\n```', idx+3) > 0; // 中间有开始行，再后面也有结束行
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
