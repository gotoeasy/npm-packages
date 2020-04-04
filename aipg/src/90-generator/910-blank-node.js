gen.on(Types.Root, function (node){

    if (!node.nodes || !node.nodes.length) {
        return '';
    }

    let ary = [];
    node.nodes.forEach(nd => {
        ary.push(gen.at('代码生成', nd));
    });
    return ary.join('\r\n');

});

gen.on(Types.Excel, function (node){

    if (!node.nodes || !node.nodes.length) {
        return '';
    }

    let ary = [];
    node.nodes.forEach(nd => {
        ary.push(gen.at('代码生成', nd));
    });
    return ary.join('\r\n');

});

gen.on(Types.SheetOther, function (node){

    if (!node.nodes || !node.nodes.length) {
        return '';
    }

    let ary = [];
    node.nodes.forEach(nd => {
        ary.push(gen.at('代码生成', nd));
    });
    return ary.join('\r\n');

});

gen.on(Types.MethodNote, function (node){

    if (!node.nodes || !node.nodes.length) {
        return '';
    }

    let ary = [];
    node.nodes.forEach(nd => {
        ary.push(gen.at('代码生成', nd));
    });
    return ary.join('\r\n');

});

gen.on(Types.Note, function (node){

    if (!node.nodes || !node.nodes.length) {
        return '';
    }

    let ary = [];
    node.nodes.forEach(nd => {
        ary.push(gen.at('代码生成', nd));
    });
    return ary.join('\r\n');

});

gen.on(Types.SheetHead, function (node){

    if (!node.nodes || !node.nodes.length) {
        return '';
    }

    let ary = [];
    node.nodes.forEach(nd => {
        ary.push(gen.at('代码生成', nd));
    });
    return ary.join('\r\n');

});
