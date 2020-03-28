gen.on(Types.Multiply, function (node){
    let ary = [];
    for (let i=0,nd,rs; nd=node.nodes[i++]; ) {
        rs = gen.at('代码生成', nd);
        if (nd.type === Types.Add || nd.type === Types.Subtract) {
            rs = `(${rs})`;
        }
        ary.push(rs);
    }
    return ary.join(' * ');
});
