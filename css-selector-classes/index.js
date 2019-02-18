const CssSelectorTokenizer = require('css-selector-tokenizer');

module.exports = function cssSelectorClasses(selector=''){

    let ast = CssSelectorTokenizer.parse(selector);

    let classes = [];
    ast.nodes.forEach(selNode => selNode.nodes.forEach(node => node.type === 'class' && classes.push('.' + node.name) && (node.name = '___---' + node.name + '---___')));
    let template = CssSelectorTokenizer.stringify(ast);
    return {classes, template};
}
