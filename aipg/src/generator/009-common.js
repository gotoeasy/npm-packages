gen.on('代码生成', function (node){
    let rs = gen.at(node.type, node);
    if (!rs) {
        console.warn('generator not found', '..........', node.type);
    }
    return rs;
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
