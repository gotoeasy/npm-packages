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

test("parser: d01p-filter-match-result.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/d01p-filter-match-result.js.xlsx" });
    let rsParser = await parser(rsReader.result);

    require("@gotoeasy/file").write("e:/1/d01p-filter-match-result.js.json", JSON.stringify(rsParser.root(), null, 2));

    t.is(1, 1);
});
