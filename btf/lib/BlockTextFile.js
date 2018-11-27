const File = require('@gotoeasy/file');

class BlockTextFile{

    constructor(fileName, isText) {
		let text = isText ? fileName : File.read(fileName);
		this.LF = text.indexOf('\r\n') >=0 ? '\r\n' : '\n';

		let lines = text.split(this.LF);
		this.list = [];
		parse(this.list, lines, this.LF);

		this.list.forEach(doc => {
			// document.getText
			Object.defineProperty(doc, 'getText', {
				enumerable: false,
				configurable: false,
				get: () => name => doc[(name+'').toLowerCase()]
			});
			
			// document.getMap
			Object.defineProperty(doc, 'getMap', {
				enumerable: false,
				configurable: false,
				get: () => name => getMap(doc[(name+'').toLowerCase()])
			});
		});

    }

    getDocuments(){
        return this.list;
    }

	getText(name){
        return this.list.length ? this.list[0][(name+'').toLowerCase()] : undefined;
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
	let bt = null;
	let name = null;
	let buf = null;
	let tmpName = null;
	for ( let line of lines ) {

		if ( isBlockStart(line) ) {
			tmpName = getBlockName(line);

			if ( !documentStart ) {
				bt = {};
			}
			if ( blockStart ) {
				put(bt, name, buf);
			}

			name = tmpName;
			buf = [];

			documentStart = true;
			blockStart = true;
		} else if ( isBlockEnd(line) ) {
			if ( blockStart ) {
				put(bt, name, buf);
			}

			name = null;
			buf = null;

			blockStart = false;
		} else if ( isDocumentEnd(line) ) {
			if ( blockStart ) {
				put(bt, name, buf);
				addBlockText(list, bt);
			}

			name = null;
			buf = null;
			bt = null;

			documentStart = false;
			blockStart = false;
		} else {
			if ( blockStart ) {
				buf[buf.length] = line;
				buf[buf.length] = lf;
			} else {
				// ignore line
			}
		}

	}

	if ( buf != null ) {
		put(bt, name, buf);
		addBlockText(list, bt);
	}
}

function addBlockText(list, bt) {
	list.push(bt);
}

function put(bt, name, buf) {
	if ( buf.length ) {
		buf.pop();
	}
	bt[name] = buf.join('');
}

function isBlockStart(line) {
    return line.indexOf('[') == 0 && line.indexOf(']') >= 1;
}

function isBlockEnd(line) {
    return line.indexOf('---------') == 0;
}

function isDocumentEnd(line) {
    return line.indexOf('=========') == 0;
}

function getBlockName(line) {
    return line.substring(1, line.indexOf(']')).toLowerCase();
}

// export
module.exports = BlockTextFile;
