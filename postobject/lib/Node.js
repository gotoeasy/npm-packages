const BaseNode = require('./BaseNode')

// 子节点类
class Node extends BaseNode{

    constructor(data={}, type='type') {
        super( data );
        this.type = data[type] || 'Unknown';
    }

    before(node){
        if ( !this.parent ) return;
        let index = this.parent.getChildIndex(this);
        if ( node === undefined ) return this.parent.getChild(index-1);
        this.parent.addChild(node, index);
    }

    after(node){
        if ( !this.parent ) return;
        let index = this.parent.getChildIndex(this);
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

    toJson() {
        let object = this.object;
        let type = this.type;

        let rs = {type, object};
        this.nodes && this.nodes.length && (rs.nodes = []) && this.nodes.forEach(node => rs.nodes.push(node.toJson()));
        return rs;
    }

}

// export
module.exports = Node;
