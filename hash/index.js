const fs = require('fs');
const fnHash32 = require('xxhashjs').h32;

function hashFile(file){
    return hashFileContents(fs.readFileSync(file));
}

function hashFileContents(contents){
    return fnHash32(0)
        .update(contents)
        .digest()
        .toString(36);
}

function hashString(str){
    // 53653: 1101000110010101
	let rs = 53653, i = (str == null ? 0 : str.length);
	while ( i ) {
		rs = (rs * 33) ^ str.charCodeAt(--i);
	}
	return rs >>> 0;
}

function hash(opts){
    if ( opts && opts.file ) {
        return hashFile(opts.file);
    }
    if ( opts && opts.contents != null ) {
        return hashFileContents(opts.contents);
    }
    
    return hashString(opts).toString(36);
}

module.exports = hash;
