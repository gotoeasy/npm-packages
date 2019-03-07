const BaseNode = require('./BaseNode')

// 根节点类
class Root extends BaseNode{

    constructor() {
        super();
        this.type = 'root';
    }

    toJson() {
        let rs = Object.assign({}, this);
        this.nodes && this.nodes.length && (rs.nodes = []) && this.nodes.forEach(node => rs.nodes.push(node.toJson()));
        return rs;
    }

}

// export
module.exports = Root;
