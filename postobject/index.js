const Root = require('./lib/Root')
const Node = require('./lib/Node')

const weakmap = new WeakMap();

postobject.plugin = (name, callback) => {
    weakmap.set(callback, require('path').parse(name).name);
    return callback;
}

function postobject(plugins=[], opts={}){
    let TYPE = opts.type || 'type';                 // 区分节点类型的属性名
    let NODES = opts.nodes || 'nodes';              // 表示子节点的属性名

    return {plugins, TYPE, NODES, process, createNode};
};

async function process(object, opts={}){

    let sTime, time;
    let root = new Root();
    object && root.addChild(createNode.bind(this)(object));
    
    let result = {};
    for ( let i=0,plugin,name; plugin=this.plugins[i++]; ) {
        name = weakmap.get(plugin);
        opts.log && (sTime = new Date().getTime());
        await plugin.bind(this)(root, result);
        opts.json && opts.json[name] && (opts.json[name] = JSON.stringify(root, null, 2));                  // 若需要，导出插件处理后的json字符串
        opts.log && ((time = new Date().getTime() - sTime) > 30) && console.info(`${name} : ${time}ms`);
    }
    return result;
}

function createNode(object){
    if ( object ) {
        let copyObject = Object.assign({}, object);
        delete copyObject[this.NODES];
        let node = new Node(copyObject, this.TYPE);
        object[this.NODES] && object[this.NODES].forEach( obj => node.addChild(this.createNode(obj)) );
        return node;
    }
    
    return new Node(object);
}


module.exports = postobject;

