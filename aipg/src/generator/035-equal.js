gen.on(Types.Equal, function (node){
    let left = gen.at('代码生成', node.nodes[0]);
    let right = gen.at('代码生成', node.nodes[1]);
    return `${left} = ${right}`;
});
