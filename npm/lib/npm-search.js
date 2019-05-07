const execa = require('execa');

// 查找指定包名，存在则返回包名，否则返回空白字符串
module.exports = function(name, opts={}){

    if ( !name ) return '';

    if ( /[\.-]+/.test(name) ) {           // 含.-的包名查不出来了...先打个补丁
        return name.trim();
    }

    let sCmd = 'npm s --json --parseable ' + name
	console.log('$> ' + sCmd);

    try{
        let rs = execa.shellSync(sCmd);
        if ( rs.code ) {
            opts.error ? opts.error(rs.stderr) : console.error( rs.stderr );
            return '';
        }

        return rs.stdout;

    }catch(e){
        opts.error ? opts.error(e) : console.error( e );
        return '';
    }
};
