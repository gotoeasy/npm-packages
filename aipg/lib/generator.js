/* ------- 000-consts-types ------- */
// 节点类型定义
const Types = {
    Var: "Var", // 变量
    Literal: "Literal", // 常数
    Break: "Break", // break
    Continue: "Continue", // continue
    Return: "Return", // return
    If: "If", // if
    GreaterThan: "GreaterThan", // 大于
    GreaterEqualThan: "GreaterEqualThan", // 大于等于
    LessThan: "LessThan", // 小于
    LessEqualThan: "LessEqualThan", // 小于等于
    Equal: "Equal", // 等于
    ExactEqual: "ExactEqual", // 严格等于
    And: "And", // 并且
    Or: "Or", // 或者
    Add: "Add", // 加
    Subtract: "Subtract", // 减
    Multiply: "Multiply", // 乘
    Divide: "Divide", // 除
    Condition: "Condition", // 条件
    Body: "Body", // 内容
};

/* ------- 001-consts-kinds ------- */
// 数据类型定义
const Kinds = {
    String: "String", // 字符串
    Var: "Var", // 变量
    Number: "Number", // 数值
    Integer: "Integer", // Integer
};

/* ------- 008-generator ------- */
const gen = new Generator();

// ---------------------------
// 简易代码生成器总线
// ---------------------------
function Generator() {
    const map = new Map(); // key:set[fn]

    // 安装事件函数
    const on = (key, fn) => {
        if (typeof fn == "function") {
            let setFn;
            if (map.has(key)) {
                setFn = map.get(key);
            } else {
                setFn = new Set();
                map.set(key, setFn);
            }
            setFn.add(fn);
            return fn;
        } else {
            let setFn = map.get(key);
            return setFn ? [...setFn] : []; // 返回函数数组
        }
    };

    // 卸载事件函数
    const off = (key, fn) => {
        if (!map.has(key)) return;

        if (!fn) {
            map.delete(key);
            return;
        }

        map.get(key).delete(fn);
    };

    // 逐个执行函数，遇生成结果非空时停止执行并返回，无函数或结果全空时返回空串
    const at = (key, ...args) => {
        if (!map.has(key)) return ""; // 找不到时返回空串

        let fns = [...map.get(key)];
        for (let fn, i = 0, rs; (fn = fns[i++]); ) {
            rs = fn(...args); // 执行函数
            if (rs) {
                return rs;
            }
        }
        return "";
    };

    // ------------- 对象方法 ------------
    this.on = on;
    this.off = off;
    this.at = at;
}

/* ------- 009-common ------- */
gen.on("代码生成", function (node) {
    return gen.at(node.type, node);
});

gen.on("查找子节点", function (node, type) {
    let nodes = node.nodes || [];
    for (let i = 0, nd; (nd = nodes[i++]); ) {
        if (nd.type === type) {
            return nd;
        }
    }
    return null;
});

/* ------- 011-var ------- */
gen.on(Types.Var, function (node) {
    // TODO
    return `${node.value}`;
});

/* ------- 012-literal ------- */
gen.on(Types.Literal, function (node) {
    if (node.kind === "String") {
        return `"${node.value}"`;
    }
    return `${node.value}`;
});

/* ------- 013-break ------- */
gen.on(Types.Break, function () {
    return "break;";
});

/* ------- 014-continue ------- */
gen.on(Types.Continue, function () {
    return "continue;";
});

/* ------- 015-return ------- */
gen.on(Types.Return, function (node) {
    if (node.nodes && node.nodes.length) {
        let rs = gen.at("代码生成", node.nodes[0]);
        return `return ${rs};`;
    } else {
        if (node.value == null) {
            return `return;`;
        }
        if (node.kind === Kinds.String) {
            return `return "${node.value}";`;
        }
        return `return ${node.value};`;
    }
});

/* ------- 021-if ------- */
gen.on(Types.If, function (node) {
    let condition = gen.at("代码生成", gen.at("查找子节点", node, Types.Condition));
    let body = gen.at("代码生成", gen.at("查找子节点", node, Types.Body));
    return `if ( ${condition} ){\r\n    ${body}\r\n}`;
});

gen.on(Types.Condition, function (node) {
    // TODO
    return gen.at("代码生成", node.nodes[0]);
});

gen.on(Types.Body, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => ary.push(gen.at("代码生成", nd)));
    return ary.join("    \r\n");
});

/* ------- 022-greater-than ------- */
gen.on(Types.GreaterThan, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} > ${right}`;
});

/* ------- 023-greater-equal-than ------- */
gen.on(Types.GreaterEqualThan, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} >= ${right}`;
});

/* ------- 024-less-than ------- */
gen.on(Types.LessThan, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} < ${right}`;
});

/* ------- 025-less-equal-than ------- */
gen.on(Types.LessEqualThan, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} <= ${right}`;
});

/* ------- 026-equal ------- */
gen.on(Types.Equal, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} == ${right}`;
});

/* ------- 027-exact-equal ------- */
gen.on(Types.ExactEqual, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} === ${right}`;
});

/* ------- 028-and ------- */
gen.on(Types.And, function (node) {
    let ary = [];
    for (let i = 0, nd, rs; (nd = node.nodes[i++]); ) {
        rs = gen.at("代码生成", nd);
        if (nd.type === Types.Or) {
            rs = `(${rs})`;
        }
        ary.push(rs);
    }
    return ary.join(" && ");
});

/* ------- 029-or ------- */
gen.on(Types.Or, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => ary.push(gen.at("代码生成", nd)));
    return ary.join(" || ");
});

/* ------- 031-add ------- */
gen.on(Types.Add, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => ary.push(gen.at("代码生成", nd)));
    return ary.join(" + ");
});

/* ------- 032-subtract ------- */
gen.on(Types.Subtract, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => ary.push(gen.at("代码生成", nd)));
    return ary.join(" - ");
});

/* ------- 033-multiply ------- */
gen.on(Types.Multiply, function (node) {
    let ary = [];
    for (let i = 0, nd, rs; (nd = node.nodes[i++]); ) {
        rs = gen.at("代码生成", nd);
        if (nd.type === Types.Add || nd.type === Types.Subtract) {
            rs = `(${rs})`;
        }
        ary.push(rs);
    }
    return ary.join(" * ");
});

/* ------- 034-divide ------- */
gen.on(Types.Divide, function (node) {
    let ary = [];
    for (let i = 0, nd, rs; (nd = node.nodes[i++]); ) {
        rs = gen.at("代码生成", nd);
        if (nd.type === Types.Add || nd.type === Types.Subtract) {
            rs = `(${rs})`;
        }
        ary.push(rs);
    }
    return ary.join(" / ");
});

/* ------- 999-exports ------- */
function print(node) {
    return gen.at("代码生成", node);
}

module.exports = print;
