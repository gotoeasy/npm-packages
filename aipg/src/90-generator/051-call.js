gen.on(Types.Call, function (node){
    if (!node.nodes || !node.nodes.length) {
        return `${node.object.value}()`;
    }

    let ary = [];
    node.nodes.forEach(nd => {
        ary.push(gen.at('代码生成', nd));
    });

    // TODO 参数
    return `${node.object.value}(${ary.join(', ')})`;
});
