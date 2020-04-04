gen.on(Types.Return, function (node){

    if (node.nodes && node.nodes.length) {
        let rs = gen.at('代码生成', node.nodes[0]);
        return `return ${rs};`;
    }else{
        if (!node.object) {
            return `return;`;
        }
        if (node.object.value == null) {
            return `return;`;
        }
        return `return ${node.object.value};`;
    }
});
