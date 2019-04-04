const os = require('@gotoeasy/os');
const File = require('@gotoeasy/file');

// TODO 过期
class Cache extends Map {
	constructor(opts={}) {
		super();
		this.path = opts.path;
		this.max = opts.max;
	}

	peek(key) {
        let oData = super.get(key);
        if ( !oData ) {
            oData = hashKey(key, this.path);
            if ( !File.existsFile(oData.file) ) return undefined;
            oData = JSON.parse(File.read(oData.file));
        }
        return oData.value;
	}

	set(key, value) {
        let oData = super.get(key);
        if ( !oData ) {
            oData = hashKey(key, this.path);
            oData.value = value;
            super.size >= this.max && super.delete(super.keys().next().value);
            super.set(key, oData);
        } else {
            oData.value = value;
            super.delete(key) > super.set(key, oData);
        }

        setTimeout( ()=>File.write(oData.file, JSON.stringify(oData)) );                // 存盘
		return value;
	}

	delete(key) {
        let oData = super.get(key) || hashKey(key, this.path);
        File.remove(oData.file);                                                        // 删除缓存文件
        return super.delete(key);                                                       // 删除缓存
	}

	get(key) {
        let oData = super.get(key);
        if ( !oData ) {
            oData = hashKey(key, this.path);
            if ( File.existsFile(oData.file) ) {
                oData = JSON.parse(File.read(oData.file));
                super.size >= this.max && super.delete(super.keys().next().value);
                super.set(key, oData);
                return oData.value;
            }
            return undefined;       // ...
        }

        super.delete(key) > super.set(key, oData);
        return oData.value;
	}
}

function hashKey(key, path){
    // 53653:   00000000 11010001 10010101
    // 863803:  00001101 00101110 00111011
    // 5139113: 01001110 01101010 10101001
	let rs1 = 53653, rs2 = 863803, rs3 = 5139113, i = (key == null ? 0 : key.length), charcode;
	while ( i ) {
        charcode = key.charCodeAt(--i);
		rs1 = (rs1 * 33) ^ charcode;
		rs2 = (rs2 * 33) ^ charcode;
		rs3 = (rs3 * 33) ^ charcode;
	}
    rs1 = rs1 >>> 0;
    rs2 = rs2 >>> 0;
    rs3 = rs3 >>> 0;

    let p1 = rs1 & 0b11111111;
    let p2 = (rs1 & 0b1111111100000000) >>> 8;
    let p3 = (rs1 & 0b111111110000000000000000) >>> 16;
    
    let file = require('path').resolve(path, `${p3}/${p2}/${p1}/${rs1.toString(36)}-${rs2.toString(36)}-${rs3.toString(36)}.json`);
	return {file};
}

module.exports = (function (oCaches={}){

    return (opts={}) => {
        let name = opts.name || 'default';
        let path = require('path').resolve(opts.path || (os.homedir() + '/.cache'), name).replace(/\\/g, '/');
		let max = opts.max > 0 && opts.max || 10000;
        if ( !oCaches[path] ) {
            oCaches[path] = new Cache({path, max});
        }
        return oCaches[path];
    }

})();
