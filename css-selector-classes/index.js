const CssSelectorTokenizer = require('css-selector-tokenizer');

module.exports = function cssSelectorClasses(selector=''){

    let ast = CssSelectorTokenizer.parse(selector);
    let classes = [];
//console.info(JSON.stringify(ast, null,4))
    // 样式类名
    ast.nodes.forEach(node => resolveClass(node, classes));

    let template = CssSelectorTokenizer.stringify(ast);
    return {classes, template};
}

function resolveClass(node, classes){
    if ( node.type === 'class' ) {
        classes.push(node.name);
        node.name = '___---' + node.name + '---___';
    }

    node.nodes && node.nodes.forEach(nd => resolveClass(nd, classes));
}