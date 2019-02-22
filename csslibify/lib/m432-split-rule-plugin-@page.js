const bus = require('@gotoeasy/bus');

// 拆解含类选择器的普通标签样式，非嵌套样式
bus.on('split-plugins', function fnPlugin(root, result) {

    let csslib = result.csslib = result.csslib || {};
    let nodes = csslib.nodes = csslib.nodes || [];

    root.walkAtRules('page', rule => {

        if ( !(rule.parent.type === 'atrule' || rule.parent.name === 'media' || rule.parent.parent.type === 'root') ) return;

        let mediaRule = rule.parent.clone();
        let pageRule = rule.clone();
        mediaRule.removeAll();
        mediaRule.append(pageRule)

        let oNode = {};
        oNode.print = true;
        oNode.template = mediaRule.toString();
        oNode.toString = () => oNode.template;

        nodes.push(oNode)

        rule.remove();
    });

});
