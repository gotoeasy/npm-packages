gen.on(Types.IfElseStatement, function (node){
    let ary = [];
    node.nodes.forEach(nd => ary.push(gen.at('代码生成', nd)));
    return ary.join('\r\n');
});