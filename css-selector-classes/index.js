const CssSelectorTokenizer = require('css-selector-tokenizer');

module.exports = function cssSelectorClasses(selector=''){

    let ast = CssSelectorTokenizer.parse(selector);

    let rs = [];
    ast.nodes.forEach(selNode => selNode.nodes.forEach(node => node.type === 'class' && rs.push('.' + node.name)));
    return rs;
}
