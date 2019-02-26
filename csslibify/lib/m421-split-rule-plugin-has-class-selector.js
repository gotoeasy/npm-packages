const bus = require('@gotoeasy/bus');

// 拆解含类选择器的普通标签样式，非嵌套样式
bus.on('split-plugins', function fnPlugin(root, result) {

    let nodes = bus.at('process-result-of-split-postcss-plugins').nodes; // 处理结果节点数组

    root.walkRules( rule => {

        if ( rule.parent.type !== 'root' ) return;

        let oSelector = bus.at('parseSingleSelector', rule.selector);
        if ( !oSelector.classes ) return;

        let oNode = {};
        oSelector.elements && (oNode.elements = oSelector.elements);
        oSelector.classes && (oNode.classes = oSelector.classes);
        oSelector.notclasses && (oNode.notclasses = oSelector.notclasses);
        oSelector.attributes && (oNode.attributes = oSelector.attributes);
        oSelector.universal && (oNode.universal = oSelector.universal);

        rule.selector = oSelector.selectorTemplate; // .foo > .bar => .<%foo%> > .<%bar%>

        oNode.template = rule.toString();
        oNode.toString = bus.at('template-to-tostring', oNode.template, ...oSelector.classes);

        nodes.push(oNode)

        rule.remove();
    });

});
