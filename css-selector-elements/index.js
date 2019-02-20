const CssSelectorTokenizer = require('css-selector-tokenizer');

module.exports = function cssSelectorClasses(selector=''){

    let ast = CssSelectorTokenizer.parse(selector);
    let oSet = new Set();
//console.info(JSON.stringify(ast, null,4))
    ast.nodes.forEach(node => resolveElement(node, oSet));
    return [...oSet];
}

function resolveElement(node, oSet){
    if ( node.type === 'element' ) {
        oSet.add(node.name.toLowerCase())
    }

    node.nodes && node.nodes.forEach(nd => resolveElement(nd, oSet));
}