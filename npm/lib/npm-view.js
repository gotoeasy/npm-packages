const File = require('@gotoeasy/file');
const execa = require('execa');
const homedir = require('./homedir');

const MaxSize = 300;
const CacheFile = homedir() + '/.gotoeasy/.npm/_valid-pkgs.json';

// 查找指定包名，存在则返回包名，否则返回空串''
module.exports = (function(map){

    return function(name, opts={}){

        if ( !map ){
            map = new Map();
            if ( File.existsFile(CacheFile) ) {
                let aryPkgs = JSON.parse(File.read(CacheFile));
                aryPkgs.forEach(pkg => map.set(pkg, 1));
            }
        }

        if ( !name ) return '';
        if ( map.has(name) ) return name;

        let sCmd = 'npm view ' + name + ' name';
        console.log('$> ' + sCmd);

        try{
            let rs = execa.shellSync(sCmd);
            map.size >= MaxSize && map.delete(map.keys().next().value);
            map.set(name, 1);
            File.write(CacheFile, JSON.stringify([...map.keys()]));
            return rs.stdout;
        }catch(e){
            return '';
        }
    };

})();
