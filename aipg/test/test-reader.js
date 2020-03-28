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
