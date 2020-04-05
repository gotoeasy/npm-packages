gen.on(Types.SheetSection, function (node){

    let ary = [];
    if (node.object.type === Types.Method) {

        let comments = ['/*'];
        comments.push(`* ${node.object.value}`);
        comments.push('*');
        let params = [];
        let parameters = node.object.parameters;
        parameters.forEach(p=>{
            params.push(`${p.type} ${p.value}`);
            comments.push(`* @param ${p.value} ${p.type} ${p.name}`);
        });
        if (node.object.returnType) {
            comments.push(`* @return ${node.object.returnType}`);
        }
        comments.push('*/');

        ary.push(comments.join('\r\n'));
        ary.push(`public ${node.object.returnType} ${node.object.methodName}(${params.join(', ')}) {`);
        node.nodes.forEach(nd=>{
            if (nd.type === Types.SheetSection) {
                ary.push(gen.at('代码生成', nd));
            }
        });
        ary.push(`}`);
        return ary.join('\r\n');
    }

    let ndMatchSection = node.findChild(Types.MatchSection);
    ndMatchSection.nodes.forEach(nd => {
        ary.push(gen.at('代码生成', nd));
    });
    return ary.join('\r\n');

});
