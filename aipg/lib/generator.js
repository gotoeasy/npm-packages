/* ------- 000-consts-types ------- */
// 节点类型定义
const Types = {
    Var: "Var", // 变量
    Literal: "Literal", // 常数
    Call: "Call", // 调用
    Condition: "Condition", // 条件
    Body: "Body", // 内容
    Statement: "Statement", // 语句
    IfElseStatement: "IfElseStatement", // IfElse语句
    Break: "Break", // break
    Continue: "Continue", // continue
    Return: "Return", // return
    If: "If", // if
    ElseIf: "ElseIf", // else if
    Else: "Else", // else
    GreaterThan: "GreaterThan", // >
    GreaterEqualsThan: "GreaterEqualsThan", // >=
    LessThan: "LessThan", // <
    LessEqualsThan: "LessEqualsThan", // <=
    Equal: "Equal", // =
    Equals: "Equals", // ==
    ExactEquals: "ExactEquals", // ===
    And: "And", // &&
    Or: "Or", // ||
    Add: "Add", // +
    Subtract: "Subtract", // -
    Multiply: "Multiply", // *
    Divide: "Divide", // /
    LeftAddAdd: "LeftAddAdd", // ++i
    RightAddAdd: "RightAddAdd", // i++
    LeftSubtractSubtract: "LeftSubtractSubtract", // --i
    RightSubtractSubtract: "RightSubtractSubtract", // i--
};

/* ------- 001-consts-kinds ------- */
// 数据类型定义
const Kinds = {
    String: "String", // 字符串
    Var: "Var", // 变量
    Number: "Number", // 数值
    Integer: "Integer", // Integer
};

/* ------- 009-common ------- */
const gen = require("@gotoeasy/bus").newInstance();

gen.on("代码生成", function (node) {
    if (!node || !node.type) {
        return "";
    }
    let rs = gen.at(node.type, node);
    if (!rs) {
        throw new Error("generator not found  ..........  " + node.type);
    }
    return rs;
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

/* ------- 021-if-else ------- */
gen.on(Types.If, function (node) {
    let condition = gen.at("代码生成", gen.at("查找子节点", node, Types.Condition));
    let body = gen.at("代码生成", gen.at("查找子节点", node, Types.Body));
    return `if ( ${condition} ){\r\n    ${body}\r\n}`;
});

gen.on(Types.ElseIf, function (node) {
    let condition = gen.at("代码生成", gen.at("查找子节点", node, Types.Condition));
    let body = gen.at("代码生成", gen.at("查找子节点", node, Types.Body));
    return `else if ( ${condition} ){\r\n    ${body}\r\n}`;
});

gen.on(Types.Else, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => ary.push(gen.at("代码生成", nd)));
    let body = ary.join("\r\n");
    return `else {\r\n    ${body}\r\n}`;
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

/* ------- 023-greater-equals-than ------- */
gen.on(Types.GreaterEqualsThan, function (node) {
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

/* ------- 025-less-equals-than ------- */
gen.on(Types.LessEqualsThan, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} <= ${right}`;
});

/* ------- 026-equals ------- */
gen.on(Types.Equals, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} == ${right}`;
});

/* ------- 027-exact-equals ------- */
gen.on(Types.ExactEquals, function (node) {
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

/* ------- 035-equal ------- */
gen.on(Types.Equal, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} = ${right}`;
});

/* ------- 036-left-add-add ------- */
gen.on(Types.LeftAddAdd, function (node) {
    let rs = gen.at("代码生成", node.nodes[0]);
    return `++${rs}`;
});

/* ------- 037-right-add-add ------- */
gen.on(Types.RightAddAdd, function (node) {
    let rs = gen.at("代码生成", node.nodes[0]);
    return `${rs}++`;
});

/* ------- 038-left-subtract-subtract ------- */
gen.on(Types.LeftSubtractSubtract, function (node) {
    let rs = gen.at("代码生成", node.nodes[0]);
    return `--${rs}`;
});

/* ------- 039-right-subtract-subtract ------- */
gen.on(Types.RightSubtractSubtract, function (node) {
    let rs = gen.at("代码生成", node.nodes[0]);
    return `${rs}--`;
});

/* ------- 041-if-else-statement ------- */
gen.on(Types.IfElseStatement, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => ary.push(gen.at("代码生成", nd)));
    return ary.join("\r\n");
});

/* ------- 042-statement ------- */
gen.on(Types.Statement, function (node) {
    // TODO 什么时候加分号？
    let ary = [];
    node.nodes.forEach((nd) => {
        let rs = gen.at("代码生成", nd);
        if (nd.type === Types.Equal || nd.type === Types.Call) {
            rs = rs + ";";
        }
        ary.push(rs);
    });
    return ary.join("\r\n");
});

/* ------- 051-call ------- */
gen.on(Types.Call, function (node) {
    if (!node.nodes || !node.nodes.length) {
        return `${node.value}()`;
    }

    let ary = [];
    node.nodes.forEach((nd) => {
        ary.push(gen.at("代码生成", nd));
    });

    // TODO 参数
    return `${node.value}(${ary.join(", ")})`;
});

/* ------- 999-exports ------- */
function print(node) {
    return gen.at("代码生成", node);
}

module.exports = print;
