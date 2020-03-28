gen.on(Types.LeftAddAdd, function (node){
    let rs = gen.at('代码生成', node.nodes[0]);
    return `++${rs}`;
});
