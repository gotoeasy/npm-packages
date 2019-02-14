const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const npm = require('@gotoeasy/npm');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('自动安装', function(rs={}){
    
    return function autoinstall(pkg){

        pkg.indexOf(':') > 0 && (pkg = pkg.substring(0, pkg.indexOf(':')));             // @scope/pkg:component => @scope/pkg
        pkg.lastIndexOf('@') > 0 && (pkg = pkg.substring(0, pkg.lastIndexOf('@')));     // 不该考虑版本，保险起见修理一下，@scope/pkg@x.y.z => @scope/pkg

        if ( !rs[pkg] ) {
            !npm.isInstalled(pkg) && npm.install(pkg);
            rs[pkg] = true;
        }

    }

}());

