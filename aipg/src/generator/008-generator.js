const gen = new Generator();

// ---------------------------
// 简易代码生成器总线
// ---------------------------
function Generator(){

    const map = new Map(); // key:set[fn]

    // 安装事件函数
    const on = (key, fn) => {
        if (typeof fn == 'function') {
            let setFn; 
            if ( map.has(key) ) {
                setFn = map.get(key);
            }else{
                setFn = new Set();
                map.set(key, setFn);
            }
            setFn.add(fn);
            return fn;
        }else{
            let setFn = map.get(key);
            return setFn ? [...setFn] : [];                                         // 返回函数数组
        }
    };

    // 卸载事件函数
    const off = (key, fn) => {
        if ( !map.has(key) ) return;

        if ( !fn ) {
            map.delete(key);
            return;
        }

        map.get(key).delete(fn);
    };

    // 逐个执行函数，遇生成结果非空时停止执行并返回，无函数或结果全空时返回空串
    const at = (key, ...args) => {
        if ( !map.has(key) ) return '';                                             // 找不到时返回空串

        let fns = [...map.get(key)];
        for (let fn,i=0,rs; fn=fns[i++]; ) {
            rs = fn(...args);                                                       // 执行函数
            if (rs) {
                return rs;
            }
        }
        return '';
    };

    // ------------- 对象方法 ------------
    this.on = on;
    this.off = off;
    this.at = at;
}
