const Root = require('./lib/Root')
const Node = require('./lib/Node')

module.exports = function(plugins=[]){

    return {plugins, process};
};

function process(target, options={}){

    let result = {};
    let plugins = this.plugins;

    let root = new Root();
    root.addChild(createNode(target));
    
    plugins.forEach( plugin => plugin(root, result) );
    return result;
}

function createNode(target){
    let data = Object.assign({}, target);
    delete data.nodes;
    let node = new Node(data);

    target.nodes && target.nodes.forEach( tgt => node.addChild(createNode(tgt)) );
    return node;
}

