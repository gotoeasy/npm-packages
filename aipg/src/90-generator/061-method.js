gen.on(Types.Method, function (node){

    let object = node.object;
    let prefix = 'public';
    let returnType = object.returnType || 'void';
    let methodName = object.methodName;
    let params = [];
    object.parameters.forEach(p => {
        ary.push(p.type + ' ' + p.name);
    });
    let param = ary.join(', ');

    // 方法
    return `${prefix} ${returnType} ${methodName}(${param})`;
});
