const bus = require('@gotoeasy/bus');

// 删除无内容的@media样式
bus.on('split-plugins', function fnPlugin(root, result) {

    let csslib = result.csslib = result.csslib || {};
    let nodes = csslib.nodes = csslib.nodes || [];

    root.walkAtRules('media', rule => {

        if ( !rule.nodes.length ) {
            rule.remove();
        }
    });

});
