const hasha = require('hasha');

function hashFile(file){
    let str = hasha.fromFileSync(file, {algorithm: 'sha512'});
    return hashString(str).toString(36);
}

function hashString(str){
	let rs = 5381, i = (str == null ? 0 : str.length);
	while ( i ) {
		rs = (rs * 33) ^ str.charCodeAt(--i);
	}
	return rs >>> 0;
}

function hash(opts){
    if ( opts && opts.file ) {
        return hashFile(opts.file);
    }
    
    return hashString(opts).toString(36);
}


module.exports = hash;
