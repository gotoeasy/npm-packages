gen.on(Types.Method, function (node){

    let object = node.object;
    let prefix = 'public';
    let returnType = object.returnType;
    let methodName = object.methodNmae;
    let params = [];
    object.parameters.forEach(p => {
        params.push(p.type + ' ' + p.value);
    });
    let param = params.join(', ');

    let ary = [];
    node.nodes.forEach(nd => {
        ary.push(gen.at('代码生成', nd));
    });
    let sub = ary.join('\r\n');

    // 方法
    return `${prefix} ${returnType} ${methodName}(${param}) {\r\n ${sub}\r\n}`;
});
