const test = require("ava");

// ----------------------------------------------
// generator测试
// ----------------------------------------------
const generator = require("../lib/generator");
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

// 数据类型定义
const Kinds = {
    String: "String", // 字符串
    Var: "Var", // 变量
    Number: "Number", // 数值
    Integer: "Integer", // Integer
};

test("generator: 009-common.js", (t) => {
    t.is("", generator());
    t.is("", generator({}));
    t.throws(() => generator({ type: "12345" }));
});

test("generator: 011-var.js", (t) => {
    let node = {
        type: Types.Var,
        value: "count",
    };

    let oTest = { src: "count" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 012-literal.js - case 1", (t) => {
    let node = {
        type: Types.Literal,
        kind: Kinds.String,
        value: "12345",
    };

    let oTest = { src: '"12345"' };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 012-literal.js - case 2", (t) => {
    let node = {
        type: Types.Literal,
        value: "12345",
    };

    let oTest = { src: "12345" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 013-break.js", (t) => {
    let node = {
        type: Types.Break,
    };

    let oTest = { src: "break;" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 014-continue.js", (t) => {
    let node = {
        type: Types.Continue,
    };

    let oTest = { src: "continue;" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 015-return.js - case 1", (t) => {
    let node = {
        type: Types.Return,
    };

    let oTest = { src: "return;" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 015-return.js - case 2", (t) => {
    let node = {
        type: Types.Return,
        kind: Kinds.Var,
        value: "cnt",
    };

    let oTest = { src: "return cnt;" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 015-return.js - case 3", (t) => {
    let node = {
        type: Types.Return,
        kind: Kinds.String,
        value: "abcd",
    };

    let oTest = { src: 'return "abcd";' };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 015-return.js - case 4", (t) => {
    let node = {
        type: Types.Return,
        kind: Kinds.Number,
        value: 12345,
    };

    let oTest = { src: "return 12345;" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 015-return.js - case 5", (t) => {
    let node = {
        type: Types.Return,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "amount",
            },
        ],
    };

    let oTest = { src: "return amount;" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 021-if-else.js - case 1", (t) => {
    let node = {
        type: Types.If,
        nodes: [
            {
                type: Types.Condition,
                nodes: [
                    {
                        type: Types.GreaterThan,
                        nodes: [
                            {
                                type: Types.Var,
                                kind: Kinds.Integer,
                                value: "amount",
                            },
                            {
                                type: Types.Literal,
                                value: 0,
                            },
                        ],
                    },
                ],
            },
            {
                type: Types.Body,
                nodes: [
                    {
                        type: Types.Return,
                        nodes: [
                            {
                                type: Types.Var,
                                kind: Kinds.Integer,
                                value: "amount",
                            },
                        ],
                    },
                ],
            },
        ],
    };

    let oTest = { src: "if ( amount > 0 ){\r\n    return amount;\r\n}" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 021-if-else.js - case 2", (t) => {
    let node = {
        type: Types.ElseIf,
        nodes: [
            {
                type: Types.Condition,
                nodes: [
                    {
                        type: Types.GreaterThan,
                        nodes: [
                            {
                                type: Types.Var,
                                kind: Kinds.Integer,
                                value: "amount",
                            },
                            {
                                type: Types.Literal,
                                value: 0,
                            },
                        ],
                    },
                ],
            },
            {
                type: Types.Body,
                nodes: [
                    {
                        type: Types.Return,
                        nodes: [
                            {
                                type: Types.Var,
                                kind: Kinds.Integer,
                                value: "amount",
                            },
                        ],
                    },
                ],
            },
        ],
    };

    let oTest = { src: "else if ( amount > 0 ){\r\n    return amount;\r\n}" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 021-if-else.js - case 3", (t) => {
    let node = {
        type: Types.Else,
        nodes: [
            {
                type: Types.Body,
                nodes: [
                    {
                        type: Types.Return,
                        nodes: [
                            {
                                type: Types.Var,
                                kind: Kinds.Integer,
                                value: "amount",
                            },
                        ],
                    },
                ],
            },
        ],
    };

    let oTest = { src: "else {\r\n    return amount;\r\n}" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 021-if-else.js - case 4", (t) => {
    let node = {
        type: Types.If,
        nodes: [
            {
                type: Types.Condition,
                nodes: [
                    {
                        type: Types.GreaterThan,
                        nodes: [
                            {
                                type: Types.Var,
                                kind: Kinds.Integer,
                                value: "amount",
                            },
                            {
                                type: Types.Literal,
                                value: 0,
                            },
                        ],
                    },
                ],
            },
        ],
    };

    let oTest = { src: "if ( amount > 0 ){\r\n    \r\n}" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 021-if-else.js - case 5", (t) => {
    let node = {
        type: Types.If,
    };

    let oTest = { src: "if (  ){\r\n    \r\n}" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 022-greater-than.js", (t) => {
    let node = {
        type: Types.GreaterThan,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt",
            },
            {
                type: Types.Literal,
                value: 999,
            },
        ],
    };

    let oTest = { src: "cnt > 999" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 023-greater-equals-than.js", (t) => {
    let node = {
        type: Types.GreaterEqualsThan,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt",
            },
            {
                type: Types.Literal,
                value: 999,
            },
        ],
    };

    let oTest = { src: "cnt >= 999" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 024-less-than.js", (t) => {
    let node = {
        type: Types.LessThan,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt",
            },
            {
                type: Types.Literal,
                value: 999,
            },
        ],
    };

    let oTest = { src: "cnt < 999" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 025-less-equals-than.js", (t) => {
    let node = {
        type: "LessEqualsThan",
        nodes: [
            {
                type: "Var",
                kind: "Integer",
                value: "cnt",
            },
            {
                type: "Literal",
                value: 999,
            },
        ],
    };

    let oTest = { src: "cnt <= 999" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 026-equals.js", (t) => {
    let node = {
        type: Types.Equals,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt",
            },
            {
                type: Types.Literal,
                value: 999,
            },
        ],
    };

    let oTest = { src: "cnt == 999" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 027-exact-equals.js", (t) => {
    let node = {
        type: Types.ExactEquals,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt",
            },
            {
                type: Types.Literal,
                value: 999,
            },
        ],
    };

    let oTest = { src: "cnt === 999" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 028-and.js - case 1", (t) => {
    let node = {
        type: Types.And,
        nodes: [
            {
                type: Types.GreaterThan,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt",
                    },
                    {
                        type: Types.Literal,
                        kind: Kinds.Integer,
                        value: 999,
                    },
                ],
            },
            {
                type: Types.LessThan,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "amount",
                    },
                    {
                        type: Types.Literal,
                        kind: Kinds.Integer,
                        value: 123,
                    },
                ],
            },
        ],
    };

    let oTest = { src: "cnt > 999 && amount < 123" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 028-and.js - case 2", (t) => {
    let node = {
        type: Types.And,
        nodes: [
            {
                type: Types.GreaterThan,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt",
                    },
                    {
                        type: Types.Literal,
                        kind: Kinds.Integer,
                        value: 999,
                    },
                ],
            },
            {
                type: Types.LessThan,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "amount",
                    },
                    {
                        type: Types.Literal,
                        kind: Kinds.Integer,
                        value: 123,
                    },
                ],
            },
            {
                type: Types.Or,
                nodes: [
                    {
                        type: Types.Equals,
                        nodes: [
                            {
                                type: Types.Var,
                                value: "abc",
                            },
                            {
                                type: Types.Literal,
                                kind: Kinds.String,
                                value: "abc",
                            },
                        ],
                    },
                    {
                        type: Types.ExactEquals,
                        nodes: [
                            {
                                type: Types.Var,
                                value: "note",
                            },
                            {
                                type: Types.Literal,
                                kind: Kinds.String,
                                value: "123",
                            },
                        ],
                    },
                ],
            },
        ],
    };

    let oTest = { src: 'cnt > 999 && amount < 123 && (abc == "abc" || note === "123")' };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 029-or.js", (t) => {
    let node = {
        type: Types.Or,
        nodes: [
            {
                type: Types.GreaterThan,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt",
                    },
                    {
                        type: Types.Literal,
                        kind: Kinds.Integer,
                        value: 999,
                    },
                ],
            },
            {
                type: Types.LessThan,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "amount",
                    },
                    {
                        type: Types.Literal,
                        kind: Kinds.Integer,
                        value: 123,
                    },
                ],
            },
        ],
    };

    let oTest = { src: "cnt > 999 || amount < 123" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 031-add.js", (t) => {
    let node = {
        type: Types.Add,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt1",
            },
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt2",
            },
            {
                type: Types.Literal,
                value: 123,
            },
        ],
    };

    let oTest = { src: "cnt1 + cnt2 + 123" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 032-subtract.js", (t) => {
    let node = {
        type: Types.Subtract,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt1",
            },
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt2",
            },
            {
                type: Types.Literal,
                value: 123,
            },
        ],
    };

    let oTest = { src: "cnt1 - cnt2 - 123" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 033-multiply.js - case 1", (t) => {
    let node = {
        type: Types.Multiply,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt1",
            },
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt2",
            },
            {
                type: Types.Literal,
                value: 123,
            },
        ],
    };

    let oTest = { src: "cnt1 * cnt2 * 123" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 033-multiply.js - case 2", (t) => {
    let node = {
        type: Types.Multiply,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt1",
            },
            {
                type: Types.Add,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt1",
                    },
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt2",
                    },
                ],
            },
            {
                type: Types.Subtract,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt1",
                    },
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt2",
                    },
                ],
            },
        ],
    };

    let oTest = { src: "cnt1 * (cnt1 + cnt2) * (cnt1 - cnt2)" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 034-divide.js - case 1", (t) => {
    let node = {
        type: Types.Divide,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt1",
            },
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt2",
            },
            {
                type: Types.Literal,
                value: 123,
            },
        ],
    };

    let oTest = { src: "cnt1 / cnt2 / 123" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 034-divide.js - case 2", (t) => {
    let node = {
        type: Types.Divide,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt1",
            },
            {
                type: Types.Add,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt1",
                    },
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt2",
                    },
                ],
            },
            {
                type: Types.Subtract,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt1",
                    },
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt2",
                    },
                ],
            },
        ],
    };

    let oTest = { src: "cnt1 / (cnt1 + cnt2) / (cnt1 - cnt2)" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 035-equal.js", (t) => {
    let node = {
        type: Types.Equal,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt",
            },
            {
                type: Types.Literal,
                value: 123,
            },
        ],
    };

    let oTest = { src: "cnt = 123" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 036-left-add-add.js", (t) => {
    let node = {
        type: Types.LeftAddAdd,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt",
            },
        ],
    };

    let oTest = { src: "++cnt" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 037-right-add-add.js", (t) => {
    let node = {
        type: Types.RightAddAdd,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt",
            },
        ],
    };

    let oTest = { src: "cnt++" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 038-left-subtract-subtract.js", (t) => {
    let node = {
        type: Types.LeftSubtractSubtract,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt",
            },
        ],
    };

    let oTest = { src: "--cnt" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 039-right-subtract-subtract.js", (t) => {
    let node = {
        type: Types.RightSubtractSubtract,
        nodes: [
            {
                type: Types.Var,
                kind: Kinds.Integer,
                value: "cnt",
            },
        ],
    };

    let oTest = { src: "cnt--" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 041-if-else-statement.js - case 1", (t) => {
    let node = {
        type: Types.IfElseStatement,
        nodes: [
            {
                type: Types.If,
                nodes: [
                    {
                        type: Types.Condition,
                        nodes: [
                            {
                                type: Types.GreaterThan,
                                nodes: [
                                    {
                                        type: Types.Var,
                                        kind: Kinds.Integer,
                                        value: "amount",
                                    },
                                    {
                                        type: Types.Literal,
                                        value: 0,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: Types.Body,
                        nodes: [
                            {
                                type: Types.Return,
                                nodes: [
                                    {
                                        type: Types.Var,
                                        kind: Kinds.Integer,
                                        value: "amount",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                type: Types.ElseIf,
                nodes: [
                    {
                        type: Types.Condition,
                        nodes: [
                            {
                                type: Types.LessEqualsThan,
                                nodes: [
                                    {
                                        type: Types.Var,
                                        kind: Kinds.Integer,
                                        value: "count",
                                    },
                                    {
                                        type: Types.Literal,
                                        value: 0,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: Types.Body,
                        nodes: [
                            {
                                type: Types.Return,
                                nodes: [
                                    {
                                        type: Types.Var,
                                        value: "count",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    let oTest = { src: "if ( amount > 0 ){\r\n    return amount;\r\n}\r\nelse if ( count <= 0 ){\r\n    return count;\r\n}" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 041-if-else-statement.js - case 2", (t) => {
    let node = {
        type: Types.IfElseStatement,
        nodes: [
            {
                type: Types.If,
                nodes: [
                    {
                        type: Types.Condition,
                        nodes: [
                            {
                                type: Types.GreaterThan,
                                nodes: [
                                    {
                                        type: Types.Var,
                                        kind: Kinds.Integer,
                                        value: "amount",
                                    },
                                    {
                                        type: Types.Literal,
                                        value: 0,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: Types.Body,
                        nodes: [
                            {
                                type: Types.Return,
                                nodes: [
                                    {
                                        type: Types.Var,
                                        kind: Kinds.Integer,
                                        value: "amount",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                type: Types.ElseIf,
                nodes: [
                    {
                        type: Types.Condition,
                        nodes: [
                            {
                                type: Types.LessEqualsThan,
                                nodes: [
                                    {
                                        type: Types.Var,
                                        kind: Kinds.Integer,
                                        value: "count",
                                    },
                                    {
                                        type: Types.Literal,
                                        value: 0,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: Types.Body,
                        nodes: [
                            {
                                type: Types.Return,
                                nodes: [
                                    {
                                        type: Types.Var,
                                        value: "count",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                type: Types.Else,
                nodes: [
                    {
                        type: Types.Return,
                    },
                ],
            },
        ],
    };

    let oTest = {
        src: "if ( amount > 0 ){\r\n    return amount;\r\n}\r\nelse if ( count <= 0 ){\r\n    return count;\r\n}\r\nelse {\r\n    return;\r\n}",
    };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 042-statement.js - case 1", (t) => {
    let node = {
        type: Types.Statement,
        nodes: [
            {
                type: Types.Equal,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt",
                    },
                    {
                        type: Types.Literal,
                        value: 123,
                    },
                ],
            },
            {
                type: Types.Equal,
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt",
                    },
                    {
                        type: Types.Literal,
                        value: 123,
                    },
                ],
            },
            {
                type: Types.Call,
                value: "fnTest",
            },
            {
                type: Types.Call,
                value: "fnTest2",
                nodes: [],
            },
            {
                type: Types.Call,
                value: "fnTest3",
                nodes: [
                    {
                        type: Types.Var,
                        kind: Kinds.Integer,
                        value: "cnt",
                    },
                ],
            },
        ],
    };

    let oTest = { src: "cnt = 123;\r\ncnt = 123;\r\nfnTest();\r\nfnTest2();\r\nfnTest3(cnt);" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 042-statement.js - case 2", (t) => {
    let node = {
        type: Types.Statement,
        nodes: [
            {
                type: Types.If,
                nodes: [
                    {
                        type: Types.Condition,
                        nodes: [
                            {
                                type: Types.GreaterThan,
                                nodes: [
                                    {
                                        type: Types.Var,
                                        kind: Kinds.Integer,
                                        value: "amount",
                                    },
                                    {
                                        type: Types.Literal,
                                        value: 0,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: Types.Body,
                        nodes: [
                            {
                                type: Types.Return,
                            },
                        ],
                    },
                ],
            },
        ],
    };

    let oTest = { src: "if ( amount > 0 ){\r\n    return;\r\n}" };
    let src = generator(node);
    t.is(src, oTest.src);
});

test("generator: 051-call.js", (t) => {
    let node = {
        type: Types.Call,
        value: "fnTest",
    };

    let oTest = { src: "fnTest()" };
    let src = generator(node);
    t.is(src, oTest.src);
});
