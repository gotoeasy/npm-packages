// 树节点基类
class BaseNode{

    constructor(object) {
        object && (this.object = object);
        Object.defineProperty(this, "parent", {
            value : undefined,
            configurable : true,
            writable : true
        });
    }

    walk(typeOrRegexpOrCallback, callback, opts) {
        if ( !this.nodes ) return;

        // 整理参数
        let type, regexp, fnCallback, readonly = false;
        if ( isFunction(typeOrRegexpOrCallback) ) {
            fnCallback = typeOrRegexpOrCallback;
            if ( isPlainObject(callback) ) {
                readonly = !!callback.readonly;
            }
        }else{
            isString(typeOrRegexpOrCallback) && (type = typeOrRegexpOrCallback);
            isRegExp(typeOrRegexpOrCallback) && (regexp = typeOrRegexpOrCallback);
            isFunction(callback) && (fnCallback = callback);
            if ( isPlainObject(opts) ) {
                readonly = !!opts.readonly;
            }
        }

        if ( !fnCallback || !this.nodes) return;                        // 没有回调函数或没有子节点则不处理

        let nodes = readonly ? this.nodes : [ ...this.nodes ];          // 默认复制后安全的遍历，如果指定为只读则直接遍历

        // 遍历子节点
        for ( let i=0,node,rs; node=nodes[i++]; ) {
            if ( type !== undefined && type !== node.type ) continue;
            if ( regexp && !regexp.test(node.type) ) continue;

            rs = fnCallback(node, node.object);
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
        let cloneNode = new this.constructor(Object.assign({}, this.object));     // TODO 深度克隆数据？
        cloneNode.type = this.type;
        cloneNode.parent = this.parent;
        this.nodes && this.nodes.length && (cloneNode.nodes = []) && this.nodes.forEach( node => cloneNode.addChild(node.clone()) );
        return cloneNode;
    }

    remove(){
        this.parent && this.parent.removeChild(this);
    }

    replaceWith(...nodes){
        let parent = this.parent;
        if ( !parent ) return;
        let index = parent.getChildIndex(this);
        nodes.forEach(node => parent.addChild(node, index++));
        parent.removeChild(this);
    }

    addChild(node, index=-1){
        this.nodes = this.nodes || [];
        index < 0 && (index = this.nodes.length);
        this.nodes.splice(index, 0, node);
        node.parent = this;
    }

    getChildIndex(node){
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
            !this.nodes.length && delete this.nodes;
        }
        node.parent && delete node.parent;
    }

    removeAll(){
        if ( !this.nodes ) return;
        while(this.nodes.length){
            delete this.nodes.pop().parent;
        }
        delete this.nodes;
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
