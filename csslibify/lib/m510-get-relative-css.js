const bus = require('@gotoeasy/bus');
const os = require('@gotoeasy/os');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const PTask = require('@gotoeasy/p-task');
const cssSelectorClasses = require('@gotoeasy/css-selector-classes');
const cssSelectorElements = require('@gotoeasy/css-selector-elements');
const postcss = require('postcss');



// 按需引用样式
module.exports = bus.on('get-relative-css', function(){

    return function (opt={}) {

        let pkg = opt.pkg || this.pkg;
        let requireClasses = opt.classes || [];
        if ( !requireClasses.length ) {
            return '';  // 当前仅实现通过类名按需引用
        }

        let rs = '';
        for ( let i=0,node,match; node=this.nodes[i++]; ) {
            if ( !node.classes ) {
                continue;
            }
            
            match = true;
            for ( let j=0,cls; cls=node.classes[j++]; ) {
                if ( !requireClasses.includes(cls) ) {
                    match = false;
                    break;
                }
            }

            match && (rs += node.toString(pkg, opt.rename) + '\n' );
        }

        return rs;
    }

}());

