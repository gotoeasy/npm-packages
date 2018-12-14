const bus = require('@gotoeasy/bus');
const PTask = require('@gotoeasy/p-task');
const Btf = require('@gotoeasy/btf');
const acorn = require('acorn');

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
			editBtfDocument(btf.getDocument(), btfFile);

			resolve( btf );
		}catch(e){
			reject(Error.err(MODULE + 'parse btf failed', btfFile, e));
		}
	});


	return function (btfFile, restart=false) {
		return restart ? ptask.restart(btfFile) : ptask.start(btfFile)
	};

}());


function editBtfDocument(doc, file){

	// 注意块名为小写，编辑后的数据对象将作为模板数据对象直接传给代码模板
	doc.view			= (doc.getText('view') || '').trim();
	doc.options			= (doc.getText('options') || '').trim() || '{}';
	doc.state			= (doc.getText('state') || '').trim() || '{}';
	doc.actions			= (doc.getText('actions') || '').trim() || '{}';
	doc.methods			= (doc.getText('methods') || '').trim() || '{}';
	doc.css				= (doc.getText('css') || '').trim();
	doc.less			= (doc.getText('less') || '').trim();
	doc.scss			= (doc.getText('scss') || '').trim();
	doc.mount			= (doc.getText('mount') || '').trim();

	// API块特殊处理
	let oApi			= getApiObject( doc.getMap('api') );
	oApi.rposepkg		= oApi.rposepkg || oApi['rpose-pkg'];
	oApi.optionkeys		= oApi.optionkeys || oApi['option-keys'];
	oApi.statekeys		= oApi.statekeys || oApi['state-keys'];

	doc.tag				= bus.at('默认标签名', file);					// 没有指定tag时按文件名取默认标签名
	doc.rposepkg		= oApi.rposepkg;								// 包名
	doc.optionkeys		= parseKeys(oApi.optionkeys);					// 可配置KEY
	doc.statekeys		= parseKeys(oApi.statekeys);					// 可变更KEY
	doc.actionskeys		= getObjectKeys(doc.actions);					// 事件KEY
	doc.methodskeys		= getObjectKeys(doc.methods);					// 方法KEY
	doc.singleton		= toBoolean(oApi.singleton)						// 单例组件

	doc.$componentName	= bus.at('组件类名', doc.tag, doc.rposepkg);		// 组件类名
	doc.file			= file;
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


function getObjectKeys(jsonStr){
	if ( !jsonStr.trim() ) {
		return null;
	}

console.debug(MODULE, 'let x =', jsonStr)

    let ast = acorn.parse('let x = ' + jsonStr);
	let props = ast.body[0].declarations[0].init.properties;
	let keys = [];
	props.forEach(node => keys.push(node.key.name || node.key.value));
	return keys;
}


// 直接运算为false则返回false，字符串（不区分大小写）‘0’、‘f’、‘false’、‘n’、‘no’ 都为false，其他为true
function toBoolean(arg){
	if ( !arg ) return false;
	if ( typeof arg !== 'string' ) return true;
	return !/^(0|false|f|no|n)$/i.test((arg + '').trim());
}
