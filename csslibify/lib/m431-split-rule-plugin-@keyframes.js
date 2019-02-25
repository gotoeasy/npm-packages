const bus = require('@gotoeasy/bus');

// 拆解含类选择器的普通标签样式，非嵌套样式
bus.on('split-plugins', function fnPlugin(root, result) {

    let nodes = bus.at('process-result-of-split-postcss-plugins').nodes; // 处理结果节点数组

    root.walkAtRules('keyframes', rule => {

        if ( rule.parent.type !== 'root' ) return;

        let name = rule.params;                     // keyframes名
        rule.params = '<%' + name + '%>';
        
        let oNode = {};
        oNode.animation = name;                     // 动画名，也是要改名的
        oNode.template = rule.toString();
        oNode.toString = bus.at('template-to-tostring', oNode.template, name);

        nodes.push(oNode)

        rule.remove();
    });

});
