// ---------------------------
// 源文件解析
// ---------------------------
const Btf = require('@gotoeasy/btf');
const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');
const bus = require('@gotoeasy/bus');

const acorn = require('acorn');
const xxhashjs = require('xxhashjs');

const compiler = require('../../compiler/compiler');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('源文件解析', function(){

	return async function(file){
		console.debug(MODULE, 'parse btf:', file);
		let btf =  new Btf(file);

		// 编译前预处理
		let docs = btf.getDocuments();
		for ( let i=0; i<docs.length; i++ ) {
			await editDocument(docs[i], file);
		}
		return btf;
	};

}());




async function editDocument(doc, file){

	let fileDefaultTag = getFileDefaultTag(file);

	// 注意块名为小写，编辑后的doc将作为模板数据对象直接传给代码模板
	doc.api				= (doc.getText('api') || '').trim();
	doc.html			= (doc.getText('html') || '').trim();
	doc.css				= (doc.getText('css') || '').trim();
	doc.less			= (doc.getText('less') || '').trim();
	doc.scss			= (doc.getText('scss') || '').trim();
	doc.options			= (doc.getText('options') || '').trim() || '{}';
	doc.state			= (doc.getText('state') || '').trim() || '{}';
	doc.actions			= (doc.getText('actions') || '').trim() || '{}';
	doc.methods			= (doc.getText('methods') || '').trim() || '{}';
	doc.updater			= (doc.getText('updater') || '').trim() || 'null';
	doc.mount			= (doc.getText('mount') || '').trim();

	doc.file			= file;

	// 变量替换 ${变量}
	let varMap = removeComment( doc.getMap('@variables') );	// 去注释、Trim处理
	let keys = [...varMap.keys()];
	keys.forEach(k => varMap.set(k, hashContent(varMap.get(k)))); // 值用Md5转换

	varMap.forEach((v,k)=>{
		let reg = regExp_g(k);
		doc.api = doc.api.replace(reg, v);
		doc.html = doc.html.replace(reg, v);
		doc.css = doc.css.replace(reg, v);
		doc.less = doc.less.replace(reg, v);
		doc.scss = doc.scss.replace(reg, v);
		doc.options = doc.options.replace(reg, v);
		doc.state = doc.state.replace(reg, v);
		doc.actions = doc.actions.replace(reg, v);
		doc.methods = doc.methods.replace(reg, v);
		doc.updater = doc.updater.replace(reg, v);
		doc.mount = doc.mount.replace(reg, v);
	});

	// api特殊处理
	let mapApi = removeComment( doc.getMap('api') );	// 去注释、Trim处理

	doc.tag = (mapApi.get('tag') || '').trim() || fileDefaultTag;
	doc.optionkeys = parseKeys(mapApi.get('optionKeys'));	// 可配置属性
	doc.statekeys = parseKeys(mapApi.get('stateKeys'));		// 可变更属性
	doc.actionskeys = JSON.stringify(getObjectKeys(doc.actions));			// 事件属性
	doc.methodskeys = JSON.stringify(getObjectKeys(doc.methods));			// 方法属性
	doc.singleton = toBoolean(mapApi.get('singleton'))		// 单例组件

	doc.$componentName = getComponentName(doc.tag);	// 组件类名
	doc.$fnTemplate = compiler(doc);				// 模板函数源码，html为模板，state、options、methods等用于检查模板变量

	// statekeys的$SLOT可在编译期判断得知，所以程序可以省略不写
	if ( doc.$fnTemplate.indexOf('.$SLOT ') > 0 ) {
		if ( doc.statekeys == 'null' ) {
			doc.statekeys = '["$SLOT"]';
		}else{
			let keys = JSON.parse(doc.statekeys);
			if ( !keys.includes('$SLOT') ) {
				keys.push('$SLOT');
				doc.statekeys = JSON.stringify(keys);
			}
		}
	}


	const manager = bus.at('编译管理');
	manager.tagRequires[doc.tag] = doc.requires;			// 本组件所直接依赖的其他组件（set）

	if ( doc.less ) {
		doc['css'] = await bus.at('LESS编译', doc.less + '\n' + doc.css, file);
	}
	if ( doc.scss ) {
		doc['css'] = await bus.at('SCSS编译', doc.scss + '\n' + doc.css, file);
	}

}

//function md5(str){
//	return '_' + new Md5().update(str).digest('hex');
//}

function hashContent(content){
    // xxhashjs.h32 xxhashjs.h64;
    return '_' + xxhashjs.h32(0).update(content).digest().toString(32);
}


// 直接运算为false则返回false，字符串（不区分大小写）‘0’、‘f’、‘false’、‘n’、‘no’ 都为false，其他为true
function toBoolean(arg){
	if ( !arg ) return false;
	if ( typeof arg !== 'string' ) return true;
	return !/^(0|false|f|no|n)$/i.test((arg + '').trim());
}

// 去注释、Trim处理
function removeComment(mapApi){
	let kv = {};
	
	mapApi.forEach((v,k) => {
		let idx = v.indexOf('//');
		idx >= 0 ? (kv[k] = v.substring(0, idx)) : (kv[k] = v); // val去注释
	});

	for ( let k in kv ) {
		mapApi.set(k, kv[k].trim());
	}
	return mapApi;
}


function parseKeys(str){
	if ( !str ) {
		return 'null';
	}
	
	let idx = str.indexOf('//');
	let txt = idx >= 0 ? str.substring(0, idx) : str; // 去注释

	// key之间可以逗号、冒号、空格分隔
	let keys = txt.replace(/[,;]/g, ' ').split(/\s/).map(v => v.trim()).filter(v => v != '');
	return JSON.stringify([...new Set(keys)]);
}


function parseOptions(str, bState){
	if ( !str ) {
		return '[]';
	}

	let ary = str.split('\n').map(v => {
		let idx = v.indexOf('//');
		if ( idx >= 0 ) {
			return v.substring(0, idx).replace(/,/g, ' ').trim(); // 去除注释，逗号分隔改成空格分隔
		}
		return v.replace(/,/g, ' ').trim();
	}).filter(v => v != '');

	let rs = [];
	ary.forEach(v => {
		let idx = v.indexOf(':');
		if ( bState ) {
			if ( idx < 0 ) {
				let props = v.split(/\s/);
				props.forEach(v => v && rs.push(v));
			}
		}else{
			if ( idx < 0 ) {
				let props = v.split(/\s/);
				props.forEach(v => v && rs.push(v));
			}else{
				let props = v.substring(0, idx).split(/\s/);
				props.forEach(v => v && rs.push(v));
			}
		}
	});

	return JSON.stringify(rs);
}


function getFileDefaultTag(file){
	return file.substring(file.lastIndexOf('/')+1).split('.')[0].toLowerCase();
}

function getComponentName(tag){
	return tag.indexOf('-') < 0 ? tag : tag.split('-').map( s => s.substring(0,1).toUpperCase()+s.substring(1) ).join(''); // abc-def -> AbcDef
}


function regExp_g(match){
	let reg = match;
	reg = reg.replace(/\^/g, '\\^');
	reg = reg.replace(/\$/g, '\\$');
	reg = reg.replace(/\./g, '\\.');
	reg = reg.replace(/\+/g, '\\+');
	reg = reg.replace(/\-/g, '\\-');
	reg = reg.replace(/\=/g, '\\=');
	reg = reg.replace(/\!/g, '\\!');
	reg = reg.replace(/\(/g, '\\(');
	reg = reg.replace(/\)/g, '\\)');
	reg = reg.replace(/\[/g, '\\[');
	reg = reg.replace(/\]/g, '\\]');
	reg = reg.replace(/\{/g, '\\{');
	reg = reg.replace(/\}/g, '\\}');
	reg = reg.replace(/\?/g, '\\?');
	reg = reg.replace(/\*/g, '\\*');

	return new RegExp('\\$\\{\\s*' + reg + '\\s*\}', 'g'); // ${ match }
}


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
