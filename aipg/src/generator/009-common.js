gen.on('代码生成', function (node){
    return gen.at(node.type, node);
});

gen.on('查找子节点', function (node, type){
    let nodes = node.nodes || [];
    for (let i=0, nd; nd=nodes[i++]; ) {
        if (nd.type === type) {
            return nd;
        }
    }
    return null;
});
