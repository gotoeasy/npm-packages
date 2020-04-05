const Types = require("./types");
const gen = require('@gotoeasy/bus').newInstance();

gen.on('代码生成', function (node){
    if (!node || !node.type) {
        return '';
    }
    let rs = gen.at(node.type, node);
    if (!rs && !gen.on(node.type)) {
        console.info('找不到生成器：', node.type);
        //throw new Error("generator not found  ..........  " + node.type);
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
