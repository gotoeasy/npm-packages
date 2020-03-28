gen.on(Types.Return, function (node){

    if (node.nodes && node.nodes.length) {
        let rs = gen.at('代码生成', node.nodes[0]);
        return `return ${rs};`;
    }else{
        if (node.value == null) {
            return `return;`;
        }
        if (node.kind === Kinds.String) {
            return `return "${node.value}";`;
        }
        return `return ${node.value};`;
    }
});
