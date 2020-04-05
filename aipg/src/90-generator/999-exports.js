function print(node){
    let src = gen.at('代码生成', node);
    return gen.at('格式化代码', src);
}

module.exports = print;
