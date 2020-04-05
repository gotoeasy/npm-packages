function print(node){
    let src = gen.at('代码生成', node);
    if (node && (node.type === Types.Root || node.type === Types.Excel || (node.parent && node.parent.type === Types.Excel))) {
        return gen.at('格式化代码', src);
    }
    return src;
}

module.exports = print;
