
const isInstalled = require('is-installed').sync;
const install = require('./npm-install');


module.exports = (function (rs={}){

    return function autoinstall(pkg){

        pkg.indexOf(':') > 0 && (pkg = pkg.substring(0, pkg.indexOf(':')));             // @scope/pkg:component => @scope/pkg
        pkg.lastIndexOf('@') > 0 && (pkg = pkg.substring(0, pkg.lastIndexOf('@')));     // 不该考虑版本，保险起见修理一下，@scope/pkg@x.y.z => @scope/pkg

        if ( !rs[pkg] ) {
            if ( !isInstalled(pkg) ) {
                rs[pkg] = install(pkg);
            }else{
                rs[pkg] = true;
            }
        }
        return rs[pkg];
    }

})();

