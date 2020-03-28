/* ------- a00-consts-sheet-types ------- */
// Sheet类型【SheetType】
const SheetType = {
    SheetVersion: "SheetVersion", // 修订履历
    SheetPageLayout: "SheetPageLayout", // 页面布局
    SheetPageItems: "SheetPageItems", // 页面项目
    SheetProcess: "SheetProcess", // 详细处理
    SheetEdit: "SheetEdit", // 编辑明细
    SheetOther: "SheetOther", // 其他
};

/* ------- a090-reuires-export ------- */
const bus = require("@gotoeasy/bus").newInstance();
const postobject = require("@gotoeasy/postobject");

module.exports = async function (input) {
    let plugins = bus.on("阅读器插件"); // 用bus.on而不是bus.at
    let context = await postobject(plugins).process(input);
    return context;
};

/* ------- b000-context-note ------- */
// context数据结构说明
/*
    context.input                                       // 存放输入对象信息
    context.input.file                                  // 输入文件
    context.input.hashcode                              // 输入文件的哈希码
    context.result                                      // 存放结果对象信息

    context.workbook                                    // 存放Excel的workbook对象
    context.Sheets[]                                    // 存放Excel的Sheet对象信息数组
    context.Sheets[].name                               // Sheet名
    context.Sheets[].hidden                             // Sheet是否隐藏
    context.Sheets[].ignore                             // Sheet是否要忽略
    context.Sheets[].type                               // Sheet类型【SheetType】
    context.Sheets[].mapMergeCell                       // 所有合并单元格的地址信息，如 Map{'A1': {addr: 'A1:C2', startRow:1, endRow:2, startColumn:1, endColumn:3}}
    context.Sheets[].maxColumn                          // Sheet最大列
    context.Sheets[].maxRow                             // Sheet最大行
    context.Sheets[].maxHeadColumn                      // Sheet头部最大行
    context.Sheets[].maxHeadRow                         // Sheet头部最大列

*/

/* ------- b01p-postobject-init-context ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 处理输入文件（单个源文件的单一节点），输入{file，hashcode}
        return postobject.plugin(/**/ __filename /**/, async function (root, context) {
            context.input = {}; // 存放输入（file，hashcode）
            context.result = {}; // 存放结果

            // 保存原始输入（file、hashcode）
            await root.walk(
                (node, object) => {
                    context.input.file = object.file; // 文件名
                    context.input.hashcode = object.hashcode; // 文件哈希码
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- b11p-excel-open ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 读取Excel文档
        return postobject.plugin(/**/ __filename /**/, async function (root, context) {
            // 打开Excel文档，往后使用context.workbook读取Excel内容，读取完后再删除
            let XlsxPopulate = require("xlsx-populate");
            context.workbook = await XlsxPopulate.fromFileAsync(context.input.file);
        });
    })()
);

/* ------- b12p-excel-get-all-sheets ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 读取全部Sheet名、是否隐藏等基本信息
        return postobject.plugin(/**/ __filename /**/, function (root, context) {
            let Sheets = [];
            for (let i = 0, sheet, name, hidden; (sheet = context.workbook.sheet(i++)); ) {
                name = sheet.name();
                hidden = sheet.hidden();
                Sheets.push({ name, hidden });
            }
            context.Sheets = Sheets;
        });
    })()
);

/* ------- b13p-excel-init-sheet-props ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 过滤掉要忽略的Sheet（删除的，隐藏的，等等），添加忽略标记
        return postobject.plugin(/**/ __filename /**/, function (root, context) {
            for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                oSheet.ignore = !!(oSheet.hidden || bus.at("是否忽略Sheet", oSheet.name));
                oSheet.type = bus.at("Sheet类型", oSheet.name);
            }
        });
    })()
);

/* ------- b21p-sheet-parse-merge-cells ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 缓存所有合并单元格的地址信息
        return postobject.plugin(/**/ __filename /**/, function (root, context) {
            for (let i = 0, oSheet, sheet; (oSheet = context.Sheets[i++]); ) {
                if (oSheet.ignore) continue; // 跳过忽略的Sheet

                sheet = context.workbook.sheet(oSheet.name);
                oSheet.mapMergeCell = getMapMergeCell(sheet); // 所有合并单元格的地址信息，如 {'A1': {addr: 'A1:C2', startRow:1, endRow:2, startColumn:1, endColumn:3}}
            }
        });
    })()
);

function getMapMergeCell(sheet) {
    let map = new Map();
    let oMergeCells = sheet._mergeCells;
    for (let addr in oMergeCells) {
        map.set(addr.split(":")[0], bus.at("地址转换", addr)); // 首单元格作为键，值为地址信息对象
    }
    return map;
}
/* ------- b22p-sheet-get-max-row-column ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 读取Sheet的最大行数列数备用
        return postobject.plugin(/**/ __filename /**/, function (root, context) {
            for (let i = 0, oSheet, usedRange; (oSheet = context.Sheets[i++]); ) {
                if (oSheet.ignore) continue; // 跳过忽略的Sheet

                usedRange = context.workbook.sheet(oSheet.name).usedRange();
                if (usedRange) {
                    oSheet.maxColumn = usedRange._maxColumnNumber;
                    oSheet.maxRow = usedRange._maxRowNumber;
                } else {
                    oSheet.maxColumn = 0;
                    oSheet.maxRow = 0;
                }
            }
        });
    })()
);

/* ------- b23p-sheet-get-head-max-row-column ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 识别【表头最大列】
        return postobject.plugin(/**/ __filename /**/, function (root, context) {
            for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                if (oSheet.ignore) continue; // 跳过忽略的Sheet

                oSheet.maxHeadColumn = guessMaxHeadColumn(context, oSheet); // 表头最大列
                oSheet.maxHeadRow = guessMaxHeadRow(context, oSheet); // 表头最大行
            }
        });
    })()
);

function guessMaxHeadColumn(context, oSheet) {
    let sheet = context.workbook.sheet(oSheet.name);
    for (let i = oSheet.maxColumn; i > 0; i--) {
        if (bus.at("右边框线", sheet, oSheet, 1, i)) {
            return i; // 第一行最后一个有右边框线的列就是表头的最后列
        }
    }
    return 0;
}

// 在前10行内猜测表头最大行
function guessMaxHeadRow(context, oSheet) {
    let sheet = context.workbook.sheet(oSheet.name);

    // 前10行最后列有底线的行都存起来
    let rows = [];
    for (let i = 1; i < 10; i++) {
        bus.at("下边框线", sheet, oSheet, i, oSheet.maxHeadColumn) && rows.push(i);
    }

    // 最后一个全有底线的行就是表头结束行了
    for (let iRow; (iRow = rows.pop()); ) {
        if (bus.at("全有下边框线", sheet, oSheet, iRow, 1, oSheet.maxHeadColumn)) {
            return iRow;
        }
    }

    return 0;
}

/* ------- b24p-sheet-update-sheet-max-column-by-head ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 修正Sheet的【最大列】范围，以表头最大宽度为准
        return postobject.plugin(/**/ __filename /**/, function (root, context) {
            for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                oSheet.maxHeadColumn && (oSheet.maxColumn = oSheet.maxHeadColumn);
            }
        });
    })()
);

/* ------- b99m-util-01-is-ignore-sheet ------- */
bus.on("是否忽略Sheet", function (name) {
    if (
        /^\s*[×✖]/.test(name) || // Sheet名称用删除符号注明删除
        /^\s*([【（<＜《(]×[】）＞>》)]|[【（<＜《(]✖[】）＞>》)])/i.test(name) || // 括号内删除符号注明删除
        /^\s*([【（<＜《(]删除[】）＞>》)]|[【（<＜《(]废弃[】）＞>》)]|[【（<＜《(]忽略[】）＞>》)]|[【（<＜《(]无视[】）＞>》)])/i.test(name) || // 文字注明删除
        /^\s*([【（<＜《(]削除[】）＞>》)]|[【（<＜《(]廃棄[】）＞>》)]|[【（<＜《(]廃止[】）＞>》)]|[【（<＜《(]無視[】）＞>》)])/i.test(name) ||
        /^\s*([【（<＜《(]delete[】）＞>》)]|[【（<＜《(]ignore[】）＞>》)]|[【（<＜《(]ignored[】）＞>》)])/i.test(name) ||
        /^\s*$/.test(name) // Sheet名称空白
    ) {
        return true;
    }

    return false;
});

/* ------- b99m-util-02-get-sheet-type ------- */
// 根据Sheet名判断Sheet类型
bus.on("Sheet类型", function (name) {
    if (/^(变更履历|修订履历|修订版本|版本|版本履历)$/.test(name) || /^(変更履歴|改訂履歴)$/.test(name)) {
        return SheetType.SheetVersion;
    }

    if (/^(页面设计|页面布局|布局|页面)$/.test(name) || /^(画面仕様|画面レイアウト|画面|レイアウト)$/.test(name)) {
        return SheetType.SheetPageLayout;
    }

    if (
        /^(页面项目|页面项目设计|页面项目明细|页面项目说明|项目说明)$/.test(name) ||
        /^(画面アイテム|画面項目|画面アイテム说明|画面項目说明|画面詳細)$/.test(name)
    ) {
        return SheetType.SheetPageItems;
    }

    if (/^(详细处理|处理设计|处理说明)$/.test(name) || /^(処理仕様|詳細処理)$/.test(name)) {
        return SheetType.SheetProcess;
    }

    if (/^编辑/.test(name) || /^編集/.test(name)) {
        return SheetType.SheetEdit;
    }

    // 其他
    return SheetType.SheetOther;
});

/* ------- b99m-util-03-cell-address-converter ------- */
// 给定一个地址(如A1或A1:B3)，转换为地址对象{addr, startRow, endRow, startColumn, endColumn}
bus.on("地址转换", (addr) => {
    if (!addr || typeof addr !== "string") return null;

    addr = addr.toUpperCase();
    let cell, startRow, endRow, startColumn, endColumn, match;
    if (addr.indexOf(":") > 1) {
        match = addr.match(/([A-Z]+)([0-9]+):([A-Z]+)([0-9]+)/);
        startColumn = bus.at("列名转数字", match[1]);
        endColumn = bus.at("列名转数字", match[3]);
        startRow = match[2] - 0;
        endRow = match[4] - 0;
        cell = match[1] + match[2]; // 起始单元格地址
    } else {
        match = addr.match(/([A-Z]+)([0-9]+)/);
        startColumn = endColumn = bus.at("列名转数字", match[1]);
        startRow = endRow = match[2] - 0;
        cell = addr; // 起始单元格地址
    }

    return { cell, addr, startRow, endRow, startColumn, endColumn };
});

bus.on("数字转列名", (iColumn) => {
    let dividend = iColumn;
    let name = "";
    let modulo = 0;

    while (dividend > 0) {
        modulo = (dividend - 1) % 26;
        name = String.fromCharCode("A".charCodeAt(0) + modulo) + name;
        dividend = Math.floor((dividend - modulo) / 26);
    }

    return name;
});

bus.on("列名转数字", (columnName) => {
    let sum = 0;
    for (let i = 0; i < columnName.length; i++) {
        sum = sum * 26;
        sum = sum + (columnName[i].charCodeAt(0) - "A".charCodeAt(0) + 1);
    }
    return sum;
});

bus.on("地址起始列数字", (addr) => {
    let match = addr.match(/^[A-Z]+/);
    return match ? bus.at("列名转数字", match[0]) : 0; // 错误地址返回0
});

/* ------- b99m-util-04-border-line-recognise ------- */
// 边框线识别
bus.on("上边框线", function (sheet, oSheet, iRow, iColumn) {
    if (!iRow || !iColumn) {
        return false; // 参数不对
    } else if (sheet.row(iRow).cell(iColumn).style("border").top) {
        return true; // 有的
    } else if (iRow <= 1) {
        return false; // 边界了
    } else {
        return sheet
            .row(iRow - 1)
            .cell(iColumn)
            .style("border").bottom; // 也有的
    }
});

bus.on("下边框线", function (sheet, oSheet, iRow, iColumn) {
    if (!iRow || !iColumn) {
        return false; // 参数不对
    } else if (sheet.row(iRow).cell(iColumn).style("border").bottom) {
        return true; // 有的
    } else {
        return sheet
            .row(iRow + 1)
            .cell(iColumn)
            .style("border").top; // 也有的
    }
});

bus.on("左边框线", function (sheet, oSheet, iRow, iColumn) {
    if (!iRow || !iColumn) {
        return false; // 参数不对
    } else if (sheet.row(iRow).cell(iColumn).style("border").left) {
        return true; // 有的
    } else if (iColumn <= 1) {
        return false; // 边界了
    } else {
        return sheet
            .row(iRow)
            .cell(iColumn - 1)
            .style("border").right; // 也有的
    }
});

bus.on("右边框线", function (sheet, oSheet, iRow, iColumn) {
    if (!iRow || !iColumn) {
        return false; // 参数不对
    } else if (sheet.row(iRow).cell(iColumn).style("border").right) {
        return true; // 有的
    } else {
        return sheet
            .row(iRow)
            .cell(iColumn + 1)
            .style("border").left; // 也有的
    }
});

bus.on("全有上边框线", function (sheet, oSheet, iRow, iStartColumn, iEndColumn) {
    if (!iRow || !iStartColumn || !iEndColumn || iStartColumn > iEndColumn) {
        return false; // 参数不对
    }

    let has = true;
    for (let column = iStartColumn; column <= iEndColumn; column++) {
        if (!bus.at("上边框线", sheet, oSheet, iRow, column)) {
            return false;
        }
    }
    return has;
});

bus.on("全有下边框线", function (sheet, oSheet, iRow, iStartColumn, iEndColumn) {
    if (!iRow || !iStartColumn || !iEndColumn || iStartColumn > iEndColumn) {
        return false; // 参数不对
    }

    let has = true;
    for (let column = iStartColumn; column <= iEndColumn; column++) {
        if (!bus.at("下边框线", sheet, oSheet, iRow, column)) {
            return false;
        }
    }
    return has;
});

bus.on("全有左边框线", function (sheet, oSheet, iColumn, iStartRow, iEndRow) {
    if (!iColumn || !iStartRow || !iEndRow || iStartRow > iEndRow) {
        return false; // 参数不对
    }

    let has = true;
    for (let row = iStartRow; row <= iEndRow; row++) {
        if (!bus.at("左边框线", sheet, oSheet, row, iColumn)) {
            return false;
        }
    }
    return has;
});

bus.on("全有右边框线", function (sheet, oSheet, iColumn, iStartRow, iEndRow) {
    if (!iColumn || !iStartRow || !iEndRow || iStartRow > iEndRow) {
        return false; // 参数不对
    }

    let has = true;
    for (let row = iStartRow; row <= iEndRow; row++) {
        if (!bus.at("右边框线", sheet, oSheet, row, iColumn)) {
            return false;
        }
    }
    return has;
});

bus.on("全有边框线", function (sheet, oSheet, iStartRow, iEndRow, iStartColumn, iEndColumn) {
    if (!iStartRow || !iEndRow || iStartRow > iEndRow || !iStartColumn || !iEndColumn || iStartColumn > iEndColumn) {
        return false; // 参数不对
    }

    return (
        bus.at("全有上边框线", sheet, oSheet, iStartRow, iStartColumn, iEndColumn) &&
        bus.at("全有下边框线", sheet, oSheet, iEndRow, iStartColumn, iEndColumn) &&
        bus.at("全有左边框线", sheet, oSheet, iStartColumn, iStartRow, iEndRow) &&
        bus.at("全有右边框线", sheet, oSheet, iEndColumn, iStartRow, iEndRow)
    );
});
