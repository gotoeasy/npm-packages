gen.on(Types.SheetOther, function (node){

    let ary = [];
    node.nodes.forEach(nd => {
        ary.push(gen.at('代码生成', nd));
    });

    let className = 'HelloWorld';

    // 方法
    return `public class ${className} {
        ${ary.join('\r\n')}
    }`;
});
