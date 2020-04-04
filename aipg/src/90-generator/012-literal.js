gen.on(Types.String, function (node){
    return `"${node.object.value}"`;
});

gen.on(Types.Number, function (node){
    return `${node.object.value}`;
});

gen.on(Types.Integer, function (node){
    return `${node.object.value}`;
});

gen.on(Types.Literal, function (node){
    return `${node.object.value}`;
});
