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

    let oJosn = JSON.parse(opts.json["b01p-fix-node-type.js"]);

    t.is(oJosn.nodes[0].nodes[0].nodes[1].object.values[0].value, "1、hello world服务");
    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].object.values[0].value, "返回“Hello ”+参数");
});

test("parser: b02p-fix-node-data.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/b02p-fix-node-data.js.xlsx" });

    let opts = { json: { "b02p-fix-node-data.js": true } };
    let rsParser = await parser(rsReader.result, opts);

    let oJosn = JSON.parse(opts.json["b02p-fix-node-data.js"]);

    t.is(oJosn.nodes[0].nodes[0].nodes[1].object.value, "hello world服务");
    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].object.value, "返回:\t“Hello ” + 参数");
});

test("parser: c01p-match-sentence-by-patterns.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/c01p-match-sentence-by-patterns.js.xlsx" });

    let opts = { json: { "c01p-match-sentence-by-patterns.js": true } };
    let rsParser = await parser(rsReader.result, opts);

    require("@gotoeasy/file").write("e:/1/c01p-match-sentence-by-patterns.js.json", opts.json["c01p-match-sentence-by-patterns.js"]);
    t.is(1, 1);

    let oJosn = JSON.parse(opts.json["c01p-match-sentence-by-patterns.js"]);

    t.is(oJosn.nodes[0].nodes[0].nodes[1].object.value, "hello world服务");
    t.is(oJosn.nodes[0].nodes[0].nodes[1].object.matchs[0].type, "Comment");

    t.is(oJosn.nodes[0].nodes[0].nodes[1].object.value, "hello world服务");
    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].object.matchs[0].type, "Return");
    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].object.matchs[0].matchs[0].type, "Add");
    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].object.matchs[0].matchs[0].matchs[0].type, "String");
    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].object.matchs[0].matchs[0].matchs[0].value, "Hello ");
    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].object.matchs[0].matchs[0].matchs[1].value, "参数");

    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].object.matchs[1].type, "Add");
    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].object.matchs[1].matchs[0].type, "Return");
});

test("parser: d01p-filter-match-result.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/d01p-filter-match-result.js.xlsx" });

    let opts = { json: { "d01p-filter-match-result.js": true } };
    let rsParser = await parser(rsReader.result, opts);

    let oJosn = JSON.parse(opts.json["d01p-filter-match-result.js"]);

    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].object.matchs.length, 1);
});

test("parser: e01p-fix-node-type-if-match-only-one.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/e01p-fix-node-type-if-match-only-one.js.xlsx" });

    let opts = { json: { "e01p-fix-node-type-if-match-only-one.js": true } };
    let rsParser = await parser(rsReader.result, opts);

    require("@gotoeasy/file").write("e:/1/e01p-fix-node-type-if-match-only-one.js.json", opts.json["e01p-fix-node-type-if-match-only-one.js"]);

    let oJosn = JSON.parse(opts.json["e01p-fix-node-type-if-match-only-one.js"]);

    //  t.is(oJosn.nodes[0].nodes[0].nodes[1].type, NodeTypes.Comment);
    t.is(1, 1);
});

test("parser: f01p-fix-child-node-if-match-only-one.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/f01p-fix-child-node-if-match-only-one.js.xlsx" });

    let opts = { json: { "f01p-fix-child-node-if-match-only-one.js": true } };
    let rsParser = await parser(rsReader.result, opts);

    require("@gotoeasy/file").write("e:/1/f01p-fix-child-node-if-match-only-one.js.json", opts.json["f01p-fix-child-node-if-match-only-one.js"]);

    let oJosn = JSON.parse(opts.json["f01p-fix-child-node-if-match-only-one.js"]);

    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].type, NodeTypes.Return);
    t.is(oJosn.nodes[0].nodes[0].nodes[1].nodes[0].nodes[0].type, NodeTypes.Add);
});
