const bus = require('@gotoeasy/bus');

// 删除无内容的@supports样式
bus.on('split-plugins', function fnPlugin(root, result) {

    let csslib = result.csslib = result.csslib || {};
    let nodes = csslib.nodes = csslib.nodes || [];

    root.walkAtRules('supports', rule => {

        if ( !rule.nodes.length ) {
            rule.remove();
        }
    });

});
