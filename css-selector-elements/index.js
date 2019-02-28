const tokenizer = require('css-selector-tokenizer');

module.exports = function (selector=''){
    let nodes, oSet = new Set();
    let ast = tokenizer.parse(selector);

    if ( !ast.nodes || !ast.nodes.length ) return [];
    nodes = ast.nodes[0].nodes;
    if ( !nodes ) return [];

    parseNodes(nodes, oSet);
    return [...oSet];
};

function parseNodes(nodes, oSet){
    nodes.forEach(node => {
        node.type === 'element' && oSet.add(node.name.toLowerCase());
        node.nodes && parseNodes(node.nodes, oSet);
    })
}
