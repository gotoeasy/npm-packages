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

    async walk(typeOrRegexpOrCallback, callback, opts) {
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
            if ( !node.parent ) continue;                               // 忽略已被删除的节点
            if ( type !== undefined && type !== node.type ) continue;
            if ( regexp && !regexp.test(node.type) ) continue;

            rs = await fnCallback(node, node.object);                   // 支持异步函数
            if ( rs === false ) return rs;                              // 回调函数返回false时停止遍历
        }

        // 遍历孙节点
        for ( let i=0,node,rs; node=nodes[i++]; ) {
            if ( node.parent ) {
                rs = await node.walk(typeOrRegexpOrCallback, callback, opts);   // 忽略已被删除的节点
                if ( rs === false ) return rs;                                  // 回调函数返回false时停止遍历
            }
        }
    }

    clone(){
        let cloneNode = new this.constructor(Object.assign({}, this.object));   // TODO 深度克隆数据？
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

    // 查找父节点
    findParent(typeOrFnOrReg){
        let node = this;
        if (isFunction(typeOrFnOrReg)) {
            while (node = node.parent) {
                if (typeOrFnOrReg(node, node.object)) break;            // 找到
                if (node.type === 'root') return null;                  // 找不到
            }
        }else if (isRegExp(typeOrFnOrReg)) {
            while (node = node.parent) {
                if (typeOrFnOrReg.test(node.type)) break;               // 找到
                if (node.type === 'root') return null;                  // 找不到
            }
        }else{
            while (node = node.parent) {
                if (node.type === typeOrFnOrReg) break;                 // 找到
                if (node.type === 'root') return null;                  // 找不到
            }
        }

        return node;
    }

    // 查找兄弟节点
    findBrother(typeOrFnOrReg){
        let parent = this.parent;
        if (!parent) return null;                                       // 找不到

        let node = null;
        if (isFunction(typeOrFnOrReg)) {
            for (let i=0; node=parent.nodes[i++]; ) {
                if (node === this) continue;
                if (typeOrFnOrReg(node, node.object)) break;            // 找到
            }
        }else if (isRegExp(typeOrFnOrReg)) {
            for (let i=0; node=parent.nodes[i++]; ) {
                if (node === this) continue;
                if (typeOrFnOrReg.test(node.type)) break;               // 找到
            }
        }else{
            for (let i=0; node=parent.nodes[i++]; ) {
                if (node === this) continue;
                if (node.type === typeOrFnOrReg) break;                 // 找到
            }
        }

        return node;
    }

    // 查找子孙节点
    findChild(typeOrFnOrReg){
        let parent = this.parent;
        if (!parent) return null;                                       // 找不到

        let node = null;

        // 查找子节点
        let nodes = this.nodes || [];
        if (isFunction(typeOrFnOrReg)) {
            for (let i=0; node=nodes[i++]; ) {
                if (typeOrFnOrReg(node, node.object)) return node;      // 找到
            }
        }else if (isRegExp(typeOrFnOrReg)) {
            for (let i=0; node=nodes[i++]; ) {
                if (typeOrFnOrReg.test(node.type)) return node;         // 找到
            }
        }else{
            for (let i=0; node=nodes[i++]; ) {
                if (node.type === typeOrFnOrReg) return node;           // 找到
            }
        }

        // 查找孙节点
        for (let i=0; node=nodes[i++]; ) {
            if (node = node.findChild(typeOrFnOrReg)) {
                return node;                                            // 找到
            }
        }

        return null;                                                    // 找不到
    }

}


function isRegExp(obj){
    return _toString(obj) === '[object RegExp]';
}

function isString(obj){
    return _toString(obj) === '[object String]';
}

function isFunction(obj){
    return _toString(obj).indexOf('Function') > 0;
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
