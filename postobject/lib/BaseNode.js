// 树节点基类
class BaseNode{

    constructor(obj={}, dataField=false) {
        if ( isPlainObject(obj) ) {
            for ( let k in obj ) {
                k !== 'parent' && k !== 'nodes' && (this[k] = obj[k]);
            }
        }
    }

    walk(typeOrRegexpOrCallback, callback) {
        if ( !this.nodes ) return;

        // 整理参数
        let type, regexp, fnCallback;
        if ( isFunction(typeOrRegexpOrCallback) ) {
            fnCallback = typeOrRegexpOrCallback;
        }else{
            isString(typeOrRegexpOrCallback) && (type = typeOrRegexpOrCallback);
            isRegExp(typeOrRegexpOrCallback) && (regexp = typeOrRegexpOrCallback);
            isFunction(callback) && (fnCallback = callback);
        }

        if ( !fnCallback ) return;
        let nodes = [ ...this.nodes ];                                  // 确保遍历原节点，且不受回调函数编辑影响

        // 遍历子节点
        for ( let i=0,node,rs; node=nodes[i++]; ) {
            if ( type !== undefined && type !== node.type ) continue;
            if ( regexp && !regexp.test(node.type) ) continue;

            rs = fnCallback(node);
            if ( rs === false ) return rs;                              // 回调函数返回false时停止遍历
        }

        // 遍历孙节点
        for ( let i=0,node,rs; node=nodes[i++]; ) {
            if ( node.parent ) {
                rs = node.walk(typeOrRegexpOrCallback, callback);       // 忽略已被删除的节点
                if ( rs === false ) return rs;                          // 回调函数返回false时停止遍历
            }
        }
    }

    clone(){
        let oClone = new this.constructor(Object.assign({}, this));     // TODO 深度克隆
        oClone.parent = this.parent;
        delete oClone.nodes;
        this.nodes && (oClone.nodes = []) && this.nodes.forEach( node => oClone.addChild(node.clone()) );
        return oClone;
    }

    remove(){
        if ( !this.parent ) return;
        this.parent.removeChild(this);
    }

    replaceWith(...nodes){
        let parent = this.parent;
        if ( !parent ) return;
        let index = parent.getIndex(this);
        nodes.forEach(node => parent.addChild(node, index++));
        parent.removeChild(this);
    }

    addChild(node, index=-1){
        this.nodes = this.nodes || [];
        index < 0 && (index = this.nodes.length);
        this.nodes.splice(index, 0, node);
        node.parent = this;
    }

    getIndex(node){
        return this.nodes ? this.nodes.indexOf(node) : undefined;
    }

    getChild(index){
        return this.nodes ? this.nodes[index] : undefined;
    }

    getFirstChild(){
        return this.getChild(0);
    }

    getLastChild(){
        return this.nodes ? this.getChild(this.nodes.length-1) : undefined;
    }

    removeChild(node){
        if ( this.nodes ){
            let index = this.nodes.indexOf(node);
            index >= 0 && this.nodes.splice(index, 1);
        }
        delete node.parent;
    }

    removeAll(){
        if ( !this.nodes ) return;
        while(this.nodes.length){
            delete this.nodes.pop().parent;
        }
    }

    toJson() {
        let rs = Object.assign({}, this);
        delete rs.parent;
        delete rs.nodes;

        if ( this.nodes ){
            rs.nodes = [];
            this.nodes.forEach(node => rs.nodes.push(node.toJson()));
        }
        
        return rs;
    }


}


function isRegExp(obj){
    return _toString(obj) === '[object RegExp]';
}

function isString(obj){
    return _toString(obj) === '[object String]';
}

function isFunction(obj){
    return _toString(obj) === '[object Function]';
}

function isArray(obj){
    return _toString(obj) === '[object Array]';
}

function isPlainObject(obj){
    return _toString(obj) === '[object Object]';
}

function _toString(obj){
    return Object.prototype.toString.call(obj)
}

// export
module.exports = BaseNode;
