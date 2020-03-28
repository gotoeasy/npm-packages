gen.on(Types.Statement, function (node){
    // TODO 什么时候加分号？
    let ary = [];
    node.nodes.forEach(nd => {
        let rs = gen.at('代码生成', nd);
        if (nd.type === Types.Equal || nd.type === Types.Call) {
            rs = rs + ';';
        }
        ary.push(rs);
    });
    return ary.join('\r\n');
});
