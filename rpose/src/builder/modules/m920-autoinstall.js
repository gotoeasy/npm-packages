const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const npm = require('@gotoeasy/npm');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('自动安装', function(){
    
    return function autoinstall(pkg){

        let cache = bus.at('缓存', 'autoinstall');
        if ( !cache.get(pkg) ) {
            !npm.isInstalled(pkg) && npm.install(pkg);
            cache.put(pkg, true);
        }

    }

}());

