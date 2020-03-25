gen.on(Types.Call, function (node){
    if (!node.nodes || !node.nodes.length) {
        return `${node.value}()`;
    }

    let ary = [];
    node.nodes.forEach(nd => {
        ary.push(gen.at('代码生成', nd));
    });

    // TODO 参数
    return `${node.value}(${ary.join(', ')})`;
});
