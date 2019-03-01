const BaseNode = require('./BaseNode')

// 根节点类
class Root extends BaseNode{

    constructor() {
        super();
        this.type = 'root';
        delete this.data;
    }

}

// export
module.exports = Root;
