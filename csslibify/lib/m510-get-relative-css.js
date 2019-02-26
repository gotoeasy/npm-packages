const bus = require('@gotoeasy/bus');

// 按需引用样式
module.exports = bus.on('get-relative-css', function(){

    return function (...args) {
        let requireClasses = [];
        let tags = [];
        let pkg = this.pkg;
        let rename = this.rename;
        let includesElements = false;

        // 按动画名取@keyframes样式
        let getKeyframes = animationName => {
            let keyframes = this.keyframes || [];
            for ( let i=0,node; node=keyframes[i++]; ) {
                if ( node.animation === animationName ) {
                    return node.toString(pkg, rename);
                }
            }
            return '';
        }

        // 整理输入
        args.forEach(v => {
            if ( typeof v === 'string' ) {
                v.startsWith('.') ? requireClasses.push(v.trim().toLowerCase().substring(1)) : tags.push(v.trim().toLowerCase());
            }else if ( Object.prototype.toString.call(v) === '[object Object]' ){
                v.pkg && (pkg = v.pkg);
                v.rename && (rename = v.rename);
                includesElements = !!v.includesElements;
            }
        });

        // 按需查找引用
        if ( !requireClasses.length ) {
            return '';  // 暂时仅实现通过类名按需引用
        }

        let rs = [];
        for ( let i=0,node,match,classes; node=this.nodes[i++]; ) {
            classes = node.classes;
            if ( !classes ) continue;

            // 含not条件时，去除not中的类名后再比较
            if ( node.notclasses ) {
                let oSet = new Set(node.classes);
                node.notclasses.forEach(cls => oSet.delete(cls));
                classes = [...oSet];
            }
            
            // 类名全在应用范围内才算
            if ( classes.every(cls => requireClasses.includes(cls.toLowerCase())) ) {
                rs.push(node.toString(pkg, rename));
                node.animation && rs.push(getKeyframes(node.animation));    // 有动画属性时查找动画样式
            }
        }

        return rs.join('\n');
    }

}());


