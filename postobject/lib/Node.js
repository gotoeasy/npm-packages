const BaseNode = require('./BaseNode')

// 子节点类
class Node extends BaseNode{

    constructor(data) {
        super( data );
    }

    before(node){
        if ( !this.parent ) return;
        let index = this.parent.getIndex(this);
        if ( node === undefined ) return this.parent.getChild(index);
        this.parent.addChild(node, index);
    }

    after(node){
        if ( !this.parent ) return;
        let index = this.parent.getIndex(this);
        if ( node === undefined ) return this.parent.getChild(index+1);
        this.parent.addChild(node, index+1);
    }

    first(node){
        if ( !this.parent ) return;
        if ( node === undefined ) return this.parent.getFirstChild();
        this.parent.nodes.unshift(node);
    }

    last(node){
        if ( !this.parent ) return;
        if ( node === undefined ) return this.parent.getLastChild();
        this.parent.nodes.push(node);
    }

}

// export
module.exports = Node;
