
class BlockTextFile{

    constructor(fileName, isText) {
		let text = isText ? fileName : require('fs').readFileSync(fileName, 'utf-8');
		this.LF = text.indexOf('\r\n') >=0 ? '\r\n' : '\n';

		let lines = text.split(this.LF);
		this.list = [];
		parse(this.list, lines, this.LF);

		!this.list.length && this.list.push({});

		this.list.forEach(doc => {
			// getText
			Object.defineProperty(doc, 'getText', {
				enumerable: false,
				configurable: false,
				get: () => name => doc[(name+'').toLowerCase()]
			});
			
			// getMap
			Object.defineProperty(doc, 'getMap', {
				enumerable: false,
				configurable: false,
				get: () => name => getMap(doc[(name+'').toLowerCase()])
			});
		});
    }

    getDocument(){
        return this.list[0];
    }

    getDocuments(){
        return this.list;
    }

	getText(name){
        return this.list[0][(name+'').toLowerCase()];
    }

	getMap(name){
        return getMap(this.getText(name));
    }

}

function getMap(txt){
	let rs = new Map();
	let lines = (txt == null ? '' : txt.trim()).split('\n');
	lines.forEach(line => {
		let bk = '=', idx1 = line.indexOf('='), idx2 = line.indexOf(':');
		idx2 >= 0 && (idx1 < 0 || idx2 < idx1) && (bk = ':'); // 冒号在前则按冒号分隔
		let kv = line.replace(bk, '\n').split('\n').map(s=>s.trim());
		(kv.length == 2 && kv[0]) && rs.set(kv[0], kv[1]);
	});
	return rs;
}

function parse(list, lines, lf) {

	let documentStart = false;
	let blockStart = false;
	let doc = null;
	let name = null;
	let buf = null;
	let tmpName = null;
	for ( let line of lines ) {

		if ( isBlockStart(line) ) {
			tmpName = getBlockName(line);
			if ( !documentStart ) {
				doc = {};
			}
			if ( blockStart ) {
				addBlock(doc, name, buf);		// 保存上一个Block
			}

			name = tmpName;
			buf = [];

			documentStart = true;
			blockStart = true;
		} else if ( isBlockEnd(line) ) {
			if ( blockStart ) {
				addBlock(doc, name, buf);		// 保存当前Block
			}

			name = null;
			buf = null;

			blockStart = false;
		} else if ( isDocumentEnd(line) ) {
			if ( blockStart ) {
				addBlock(doc, name, buf);		// 保存当前Block
			}
			if ( documentStart ) {
				addDocument(list, doc);			// 保存当前Document
			}

			name = null;
			buf = null;
			doc = null;

			documentStart = false;
			blockStart = false;
		} else {
			if ( blockStart ) {
				if ( line.startsWith('\\[') && line.indexOf(']') > 0 || line.startsWith('\\---------') || line.startsWith('\\=========') ) {
					line = line.substring(1);	// 去除转义字符
				}
				buf[buf.length] = line;			// 拼接当前Block内容
				buf[buf.length] = lf;
			} else {
				// ignore line
			}
		}

	}

	if ( buf != null ) {
		addBlock(doc, name, buf);
		addDocument(list, doc);
	}
}

function addDocument(list, doc) {
	list.push(doc);
}

function addBlock(doc, blockName, buf) {
	if ( buf.length ) {
		buf.pop();
	}
	doc[blockName] = buf.join('');
}

function isBlockStart(line) {
	return line.startsWith('[') && line.indexOf(']') > 0;
}

function isBlockEnd(line) {
    return line.startsWith('---------');
}

function isDocumentEnd(line) {
    return line.startsWith('=========');
}

function getBlockName(line) {
	for ( let i=1; i<line.length; i++) {
		if ( line.charAt(i-1) !== '\\' && line.charAt(i) === ']' ) {
			return line.substring(1, i).toLowerCase().replace(/\\\]/g, ']');			 // 名称部分转义 [\]] => ]; 
		}
	}
	return line.substring(1, line.lastIndexOf(']')).toLowerCase().replace(/\\\]/g, ']'); // 最后一个]忽略转义 [\] => \; [\]\] => ]\
}

// export
module.exports = BlockTextFile;
