const execa = require('execa');

// 查找指定包名，存在则返回包名，否则返回空串''
module.exports = function(name, opts={}){

    if ( !name ) return '';

    let sCmd = 'npm view ' + name + ' name';
	console.log('$> ' + sCmd);

    try{
        let rs = execa.shellSync(sCmd);
        return rs.stdout;
    }catch(e){
        return '';
    }
};
