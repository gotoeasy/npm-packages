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

test("parser: d01p-filter-match-result.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/d01p-filter-match-result.js.xlsx" });
    let rsParser = await parser(rsReader.result);

    require("@gotoeasy/file").write("e:/1/d01p-filter-match-result.js.json", JSON.stringify(rsParser.root(), null, 2));

    t.is(1, 1);
});
