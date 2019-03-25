const syncExec = require('sync-exec');

// 查找指定包名，存在则返回包名，否则返回空白字符串
module.exports = function(name, opts={}){

    if ( !name ) return '';

    let sCmd = 'npm s --json --parseable ' + name
	console.log('$> ' + sCmd);

    try{
        let rs = syncExec(sCmd, opts.timeout);
        if ( rs.stderr ) {
            opts.error ? opts.error(rs.stderr) : console.error( rs.stderr );
            return '';
        }

        let out = rs.stdout;
        if ( !out ) {
            return '';
        }

        let ary = JSON.parse(out);
        let nm = name.trim().toLowerCase();
        for ( let i=0, pkg; pkg=ary[i++]; ) {
            if ( pkg.name.toLowerCase() === nm ) {
                return pkg.name;
            }
        }
        return '';

    }catch(e){
        opts.error ? opts.error(e) : console.error( e );
        return '';
    }
};
