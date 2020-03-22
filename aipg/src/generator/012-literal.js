gen.on(Types.Literal, function (node){
    if (node.kind === 'String') {
        return `"${node.value}"`;
    }
    return `${node.value}`;
});
