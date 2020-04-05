gen.on(Types.Excel, function (node){

    if (!node.nodes || !node.nodes.length) {
        return '';
    }

    let ary = [];
    ary.push(`public class ${node.object.className} {`);
        node.nodes.forEach(nd => {
            ary.push(gen.at('代码生成', nd));
        });
    ary.push('}');
    return ary.join('\r\n');

});
