const test = require("ava");

// ----------------------------------------------
// reader测试
// ----------------------------------------------
const reader = require("../lib/reader");
// Sheet类型【SheetType】
const SheetType = {
    SheetVersion: "SheetVersion", // 修订履历
    SheetPageLayout: "SheetPageLayout", // 页面布局
    SheetPageItems: "SheetPageItems", // 页面项目
    SheetProcess: "SheetProcess", // 详细处理
    SheetEdit: "SheetEdit", // 编辑明细
    SheetOther: "SheetOther", // 其他
};

test("reader: b12p-excel-get-all-sheets.js", async (t) => {
    let rs = await reader({ file: "./test/reader/b12p-excel-get-all-sheets.js.xlsx" });
    t.is(rs.Sheets.length, 3);
    t.is(rs.Sheets[0].name, "Sheet1");
    t.is(rs.Sheets[1].name, "Sheet2");
    t.is(rs.Sheets[1].hidden, true);
    t.is(rs.Sheets[2].name, "Sheet3");
});

test("reader: b13p-excel-init-sheet-props.js", async (t) => {
    let rs = await reader({ file: "./test/reader/b13p-excel-init-sheet-props.js.xlsx" });
    t.is(rs.Sheets.length, 8);
    t.is(rs.Sheets[0].name, "Sheet1");
    t.is(rs.Sheets[0].type, SheetType.SheetOther);
    t.is(rs.Sheets[1].name, "Sheet2");
    t.is(rs.Sheets[1].hidden, true);
    t.is(rs.Sheets[2].name, "✖Sheet3");
    t.is(rs.Sheets[2].ignore, true);

    t.is(rs.Sheets[3].type, SheetType.SheetVersion);
    t.is(rs.Sheets[4].type, SheetType.SheetPageLayout);
    t.is(rs.Sheets[5].type, SheetType.SheetPageItems);
    t.is(rs.Sheets[6].type, SheetType.SheetProcess);
    t.is(rs.Sheets[7].type, SheetType.SheetEdit);
});

test("reader: b21p-sheet-parse-merge-cells.js", async (t) => {
    let rs = await reader({ file: "./test/reader/b21p-sheet-parse-merge-cells.js.xlsx" });

    t.is(rs.Sheets[0].mapMergeCell.get("B3").addr, "B3:C3");
    t.is(rs.Sheets[0].mapMergeCell.get("B3").cell, "B3");
    t.is(rs.Sheets[0].mapMergeCell.get("B3").startColumn, 2);
    t.is(rs.Sheets[0].mapMergeCell.get("B3").endColumn, 3);
    t.is(rs.Sheets[0].mapMergeCell.get("B3").startRow, 3);
    t.is(rs.Sheets[0].mapMergeCell.get("B3").endRow, 3);
    t.is(rs.Sheets[0].mapMergeCell.get("D4").addr, "D4:E5");
    t.is(rs.Sheets[1].mapMergeCell.get("E5").addr, "E5:E8");
    t.is(rs.Sheets[1].mapMergeCell.get("D11").addr, "D11:F11");
});

test("reader: b22p-sheet-get-max-row-column.js", async (t) => {
    let rs = await reader({ file: "./test/reader/b22p-sheet-get-max-row-column.js.xlsx" });

    t.is(rs.Sheets[0].maxColumn, 10);
    t.is(rs.Sheets[0].maxRow, 20);
});

test("reader: b23p-sheet-get-head-max-row-column.js", async (t) => {
    let rs = await reader({ file: "./test/reader/b23p-sheet-get-head-max-row-column.js.xlsx" });

    t.is(rs.Sheets[0].maxHeadColumn, 20);
    t.is(rs.Sheets[0].maxHeadRow, 5);
});

test("reader: b24p-sheet-update-sheet-max-column-by-head.js", async (t) => {
    let rs = await reader({ file: "./test/reader/b24p-sheet-update-sheet-max-column-by-head.js.xlsx" });

    t.is(rs.Sheets[0].maxColumn, 20);
});

test("reader: c11p-sheet-parse-head.js", async (t) => {
    let rs = await reader({ file: "./test/reader/c11p-sheet-parse-head.js.xlsx" });

    t.is(rs.Sheets[0].Head.length, 2);
    t.is(rs.Sheets[0].Head[0][0].cell, "A1");
    t.is(rs.Sheets[0].Head[0][0].value, "AAA");
    t.is(rs.Sheets[0].Head[0][1].cell, "C1");
    t.is(rs.Sheets[0].Head[0][2].cell, "E1");
    t.is(rs.Sheets[0].Head[0][3].cell, "G1");
    t.is(rs.Sheets[0].Head[0][4].cell, "H1");

    t.is(rs.Sheets[0].Head[1][0].cell, "A2");
    t.is(rs.Sheets[0].Head[1][1].cell, "C2");
});

test("reader: d11p-sheet-parse-sections.js", async (t) => {
    let rs = await reader({ file: "./test/reader/d11p-sheet-parse-sections.js.xlsx" });

    // console.info(JSON.stringify(rs,null,2));

    t.is(rs.Sheets[0].Sestions.nodes.length, 2);

    t.is(rs.Sheets[0].Sestions.nodes[0].values[0].value, "A1");
    t.is(rs.Sheets[0].Sestions.nodes[0].nodes[0].values[0].value, "A1-1");
    t.is(rs.Sheets[0].Sestions.nodes[0].nodes[0].values[1].value, "A1-2");

    t.is(rs.Sheets[0].Sestions.nodes[1].values[0].value, "A2");
    t.is(rs.Sheets[0].Sestions.nodes[1].nodes[0].values[0].value, "A2-1");
});

test("reader: d21p-excel-close.js", async (t) => {
    let rs = await reader({ file: "./test/reader/d21p-excel-close.js.xlsx" });

    t.is(rs.Sheets[0].Sestions.nodes[0].values[0].value, "1、hello world服务");
    t.is(rs.Sheets[0].Sestions.nodes[0].nodes[0].values[0].value, "返回“Hello ”+参数");
});
