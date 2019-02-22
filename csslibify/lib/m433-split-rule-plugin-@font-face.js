const bus = require('@gotoeasy/bus');

// 拆解含类选择器的普通标签样式，非嵌套样式
bus.on('split-plugins', function fnPlugin(root, result) {

    let csslib = result.csslib = result.csslib || {};
    let nodes = csslib.nodes = csslib.nodes || [];

    root.walkAtRules('font-face', rule => {

        if ( rule.parent.type !== 'root' ) return;


        let oNode = {};
        oNode.fontFamily = getFontFamily(rule);
        oNode.template = rule.toString();
        oNode.toString = () => oNode.template;

        nodes.push(oNode)

        rule.remove();
    });

});

function getFontFamily(rule){
    let nodes = rule.nodes || [];
    for ( let i=0,node; node=nodes[i++]; ) {
        if ( node.prop === 'font-family' ) {
            return node.value.replace(/['"]+/g, '');
        }
    }

    return '';
}