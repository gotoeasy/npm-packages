const test = require("ava");

// ----------------------------------------------
// parser测试
// ----------------------------------------------
const postobject = require("@gotoeasy/postobject");
const reader = require("../lib/reader");
const parser = require("../lib/parser");
const NodeTypes = {
    root: "root", // 根节点类型
    Unknown: "Unknown", // Unknown
    Excel: "Excel", // Excel
    Sheet: "Sheet", // Sheet
    SheetHead: "SheetHead", // 头部
    SheetSection: "SheetSection", // 章节

    Return: "Return", // Return
    Add: "Add", // +

    String: "String", // String
    Number: "Number", // Number
    Var: "Var", // Var

    UnMatch: "UnMatch", // UnMatch
};

test("parser: b01p-fix-node-type.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/b01p-fix-node-type.js.xlsx" });

    let opts = { json: { "b01p-fix-node-type.js": true } };
    let rsParser = await parser(rsReader.result, opts);

    // require('@gotoeasy/file').write('e:/1/b01p-fix-node-type.js.json', opts.json['b01p-fix-node-type.js']);

    let json_result = {
        type: "root",
        nodes: [
            {
                object: {
                    file: "./test/parser/b01p-fix-node-type.js.xlsx",
                },
                type: "Excel",
                nodes: [
                    {
                        object: {
                            name: "Sheet1",
                        },
                        type: "SheetOther",
                        nodes: [
                            {
                                object: {
                                    header: [],
                                },
                                type: "SheetHead",
                            },
                            {
                                object: {
                                    values: [
                                        {
                                            cell: "B2",
                                            value: "1、hello world服务",
                                        },
                                    ],
                                    Seq: {
                                        cell: "B2",
                                        seq: "01",
                                        orig: "1",
                                    },
                                },
                                type: "SheetSection",
                                nodes: [
                                    {
                                        object: {
                                            values: [
                                                {
                                                    cell: "C4",
                                                    value: "返回“Hello ”+参数",
                                                },
                                            ],
                                            Seq: null,
                                        },
                                        type: "SheetSection",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    t.is(opts.json["b01p-fix-node-type.js"], JSON.stringify(json_result, null, 2));
});

test("parser: b02p-fix-node-data.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/b02p-fix-node-data.js.xlsx" });

    let opts = { json: { "b02p-fix-node-data.js": true } };
    let rsParser = await parser(rsReader.result, opts);

    //require('@gotoeasy/file').write('e:/1/b02p-fix-node-data.js.json', opts.json['b02p-fix-node-data.js']);

    let json_result = {
        type: "root",
        nodes: [
            {
                object: {
                    file: "./test/parser/b02p-fix-node-data.js.xlsx",
                },
                type: "Excel",
                nodes: [
                    {
                        object: {
                            name: "Sheet1",
                        },
                        type: "SheetOther",
                        nodes: [
                            {
                                object: {
                                    header: [],
                                },
                                type: "SheetHead",
                            },
                            {
                                object: {
                                    cell: "B2",
                                    value: "hello world服务",
                                    seq: "01",
                                },
                                type: "SheetSection",
                                nodes: [
                                    {
                                        object: {
                                            cell: "C4",
                                            value: "返回:\t“Hello ” + 参数",
                                            seq: null,
                                        },
                                        type: "SheetSection",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    t.is(opts.json["b02p-fix-node-data.js"], JSON.stringify(json_result, null, 2));
    //t.is(1, 1);
});

test("parser: c01p-match-sentence-by-patterns.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/c01p-match-sentence-by-patterns.js.xlsx" });

    let opts = { json: { "c01p-match-sentence-by-patterns.js": true } };
    let rsParser = await parser(rsReader.result, opts);

    //require('@gotoeasy/file').write('e:/1/c01p-match-sentence-by-patterns.js.json', opts.json['c01p-match-sentence-by-patterns.js']);

    let json_result = {
        type: "root",
        nodes: [
            {
                object: {
                    file: "./test/parser/c01p-match-sentence-by-patterns.js.xlsx",
                },
                type: "Excel",
                nodes: [
                    {
                        object: {
                            name: "Sheet1",
                        },
                        type: "SheetOther",
                        nodes: [
                            {
                                object: {
                                    header: [],
                                },
                                type: "SheetHead",
                            },
                            {
                                object: {
                                    cell: "B2",
                                    value: "hello world服务",
                                    seq: "01",
                                    matchs: [
                                        {
                                            type: "UnMatch",
                                            value: "hello world服务",
                                        },
                                    ],
                                },
                                type: "SheetSection",
                                nodes: [
                                    {
                                        object: {
                                            cell: "C4",
                                            value: "返回:\t“Hello ” + 参数",
                                            seq: null,
                                            matchs: [
                                                {
                                                    type: "Return",
                                                    matchs: [
                                                        {
                                                            type: "Add",
                                                            matchs: [
                                                                {
                                                                    type: "String",
                                                                    value: "Hello ",
                                                                },
                                                                {
                                                                    type: "UnMatch",
                                                                    value: "参数",
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    type: "Add",
                                                    matchs: [
                                                        {
                                                            type: "Return",
                                                            matchs: [
                                                                {
                                                                    type: "String",
                                                                    value: "Hello ",
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            type: "UnMatch",
                                                            value: "参数",
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        type: "SheetSection",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    t.is(opts.json["c01p-match-sentence-by-patterns.js"], JSON.stringify(json_result, null, 2));
    //t.is(1, 1);
});

test("parser: d01p-filter-match-result.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/d01p-filter-match-result.js.xlsx" });

    let opts = { json: { "d01p-filter-match-result.js": true } };
    let rsParser = await parser(rsReader.result, opts);

    //require('@gotoeasy/file').write('e:/1/d01p-filter-match-result.js.json', opts.json['d01p-filter-match-result.js']);

    let json_result = {
        type: "root",
        nodes: [
            {
                object: {
                    file: "./test/parser/d01p-filter-match-result.js.xlsx",
                },
                type: "Excel",
                nodes: [
                    {
                        object: {
                            name: "Sheet1",
                        },
                        type: "SheetOther",
                        nodes: [
                            {
                                object: {
                                    header: [],
                                },
                                type: "SheetHead",
                            },
                            {
                                object: {
                                    cell: "B2",
                                    value: "hello world服务",
                                    seq: "01",
                                    matchs: [
                                        {
                                            type: "UnMatch",
                                            value: "hello world服务",
                                        },
                                    ],
                                },
                                type: "SheetSection",
                                nodes: [
                                    {
                                        object: {
                                            cell: "C4",
                                            value: "返回:\t“Hello ” + 参数",
                                            seq: null,
                                            matchs: [
                                                {
                                                    type: "Return",
                                                    matchs: [
                                                        {
                                                            type: "Add",
                                                            matchs: [
                                                                {
                                                                    type: "String",
                                                                    value: "Hello ",
                                                                },
                                                                {
                                                                    type: "UnMatch",
                                                                    value: "参数",
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        type: "SheetSection",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    t.is(opts.json["d01p-filter-match-result.js"], JSON.stringify(json_result, null, 2));
    //t.is(1, 1);
});

test("parser: e01p-fix-node-type-if-match-only-one.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/e01p-fix-node-type-if-match-only-one.js.xlsx" });

    let opts = { json: { "e01p-fix-node-type-if-match-only-one.js": true } };
    let rsParser = await parser(rsReader.result, opts);

    //require('@gotoeasy/file').write('e:/1/e01p-fix-node-type-if-match-only-one.js.json', opts.json['e01p-fix-node-type-if-match-only-one.js']);

    let json_result = {
        type: "root",
        nodes: [
            {
                object: {
                    file: "./test/parser/e01p-fix-node-type-if-match-only-one.js.xlsx",
                },
                type: "Excel",
                nodes: [
                    {
                        object: {
                            name: "Sheet1",
                        },
                        type: "SheetOther",
                        nodes: [
                            {
                                object: {
                                    header: [],
                                },
                                type: "SheetHead",
                            },
                            {
                                object: {
                                    cell: "B2",
                                    value: "hello world服务",
                                    seq: "01",
                                    matchs: [
                                        {
                                            type: "UnMatch",
                                            value: "hello world服务",
                                        },
                                    ],
                                },
                                type: "UnMatch",
                                nodes: [
                                    {
                                        object: {
                                            cell: "C4",
                                            value: "返回:\t“Hello ” + 参数",
                                            seq: null,
                                            matchs: [
                                                {
                                                    type: "Return",
                                                    matchs: [
                                                        {
                                                            type: "Add",
                                                            matchs: [
                                                                {
                                                                    type: "String",
                                                                    value: "Hello ",
                                                                },
                                                                {
                                                                    type: "UnMatch",
                                                                    value: "参数",
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        type: "Return",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    t.is(opts.json["e01p-fix-node-type-if-match-only-one.js"], JSON.stringify(json_result, null, 2));
    //t.is(1, 1);
});

test("parser: f01p-fix-child-node-if-match-only-one.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/f01p-fix-child-node-if-match-only-one.js.xlsx" });

    let opts = { json: { "f01p-fix-child-node-if-match-only-one.js": true } };
    let rsParser = await parser(rsReader.result, opts);

    //require('@gotoeasy/file').write('e:/1/f01p-fix-child-node-if-match-only-one.js.json', opts.json['f01p-fix-child-node-if-match-only-one.js']);

    let json_result = {
        type: "root",
        nodes: [
            {
                object: {
                    file: "./test/parser/f01p-fix-child-node-if-match-only-one.js.xlsx",
                },
                type: "Excel",
                nodes: [
                    {
                        object: {
                            name: "Sheet1",
                        },
                        type: "SheetOther",
                        nodes: [
                            {
                                object: {
                                    header: [],
                                },
                                type: "SheetHead",
                            },
                            {
                                object: {
                                    cell: "B2",
                                    value: "hello world服务",
                                    seq: "01",
                                    matchs: [
                                        {
                                            type: "UnMatch",
                                            value: "hello world服务",
                                        },
                                    ],
                                },
                                type: "UnMatch",
                                nodes: [
                                    {
                                        object: {
                                            cell: "C4",
                                            value: "返回:\t“Hello ” + 参数",
                                            seq: null,
                                        },
                                        type: "Return",
                                        nodes: [
                                            {
                                                object: {
                                                    type: "Add",
                                                    matchs: [
                                                        {
                                                            type: "String",
                                                            value: "Hello ",
                                                        },
                                                        {
                                                            type: "UnMatch",
                                                            value: "参数",
                                                        },
                                                    ],
                                                },
                                                type: "Add",
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    t.is(opts.json["f01p-fix-child-node-if-match-only-one.js"], JSON.stringify(json_result, null, 2));
    //t.is(1, 1);
});
