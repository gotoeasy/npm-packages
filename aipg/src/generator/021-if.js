gen.on(Types.If, function (node){
    let condition = gen.at('代码生成', gen.at('查找子节点', node, Types.Condition));
    let body = gen.at('代码生成', gen.at('查找子节点', node, Types.Body));
    return `if ( ${condition} ){\r\n    ${body}\r\n}`;
});

gen.on(Types.Condition, function (node){
    // TODO
    return gen.at('代码生成', node.nodes[0]);
});

gen.on(Types.Body, function (node){
    let ary = [];
    node.nodes.forEach(nd => ary.push(gen.at('代码生成', nd)));
    return ary.join('    \r\n');
});
