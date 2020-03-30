/* ------- a00-consts-sheet-types ------- */
// Sheet类型【SheetType】
const SheetType = {
    SheetVersion: "SheetVersion", // 修订履历
    SheetPageLayout: "SheetPageLayout", // 页面布局
    SheetPageItems: "SheetPageItems", // 页面项目
    SheetProcess: "SheetProcess", // 详细处理
    SheetEdit: "SheetEdit", // 编辑明细
    SheetOther: "SheetOther", // 其他

    Excel: "Excel", // Excel
    Sheet: "Sheet", // Sheet
    SheetHead: "SheetHead", // SheetHead
    SheetSection: "SheetSection", // SheetSection
};

/* ------- a090-reuires-exports ------- */
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

    context.Sheets[].Head                               // Sheet头部信息
    context.Sheets[].Sections                           // Sheet章节信息

    context.result                                      // 存放结果对象信息

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

        function getMapMergeCell(sheet) {
            let map = new Map();
            let oMergeCells = sheet._mergeCells;
            for (let addr in oMergeCells) {
                map.set(addr.split(":")[0], bus.at("地址转换", addr)); // 首单元格作为键，值为地址信息对象
            }
            return map;
        }
    })()
);

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
    })()
);

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

/* ------- c11p-sheet-parse-head ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 解析Sheet【表头】
        return postobject.plugin(/**/ __filename /**/, function (root, context) {
            for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                if (oSheet.ignore) continue; // 跳过忽略的Sheet

                parseSheetHead(context, oSheet);
            }
        });

        function parseSheetHead(context, oSheet) {
            let sheet = context.workbook.sheet(oSheet.name);

            let trs = bus.at("边框表格全部行位置", sheet, oSheet, 1, 1, oSheet.maxHeadRow, oSheet.maxHeadColumn);
            let aryHeah = [];
            trs.forEach((tr) => {
                let ary = [];
                tr.forEach((td) => {
                    let tdv = bus.at("读值", sheet, oSheet, td.startRow, td.startColumn);
                    tdv && ary.push(tdv);
                });
                ary.length && aryHeah.push(ary);
            });
            oSheet.Head = aryHeah;
        }
    })()
);

/* ------- c99m-util-01-cell-value-reader ------- */
// -----------------------------------------------------------------------------
// 单元格读值，不是件单纯的事
// 参数可以是（行、列）或（名称地址）或（地址对象）
//
// 1，数字带日期格式的单元格 ........ 所见即所得，只应付常见格式
// 2，数字带逗号格式的单元格 ........ 直接返回原数字（转字符串）
// 3，公式单元格 .................. 所见即所得
// 4，富文本单元格带部分删除线 ...... 人性化读取，要去除删除线文字
// 5，富文本单元格带全部删除线 ...... 人性化读取，返回半角空格以区别无内容
// 6，无内容的null单元格 ........... 人性化读取，返回无内容的空串
// 7，单元格格式 .................. numberFormat和background，有则读出备用
// -----------------------------------------------------------------------------
bus.on(
    "读值",
    (function () {
        return function (sheet, oSheet, iRow, iColumn) {
            if (!iRow) return { value: "" }; // 参数输入无效时的返回值

            let oAddr;
            if (typeof iRow === "string") {
                oAddr = bus.at("地址转换", iRow); // {cell, addr, startRow, endRow, startColumn, endColumn}
            } else if (typeof iRow === "number") {
                if (!iColumn) {
                    return { value: "" }; // 参数输入无效时的返回值
                } else {
                    oAddr = bus.at("地址转换", bus.at("数字转列名", iColumn) + iRow);
                }
            } else {
                oAddr = iRow; // 传入的就是地址对象
            }

            return readCell(sheet, oAddr); // 对象或数组或空串
        };

        // 返回对象
        function readCell(sheet, oAddr) {
            let { cell } = oAddr; // cell:单元格地址
            let oCell = sheet.cell(cell);
            let value = oCell.value();

            let del = false;
            let numberFormat = null;
            let fill = null;

            if (value == null) {
                // 转成空串直接返回
                value = "";
            } else if (value.get) {
                // 富文本时，检查忽略带删除线的文字
                let txt = "";
                for (let i = 0, fragment, val; (fragment = value.get(i++)); ) {
                    val = fragment.value();
                    if (val != null) {
                        if (fragment.style("strikethrough")) {
                            del = true; // 有删除内容
                        } else {
                            txt += val;
                        }
                    }
                }
                value = txt;
            } else {
                numberFormat = oCell.style("numberFormat");
                fill = oCell.style("fill"); // background
                value = value + "";
            }

            let rs = { cell, value };
            !value && del && (rs.delete = true);
            numberFormat && numberFormat !== "General" && (rs.numberFormat = numberFormat);
            fill && (rs.fill = fill);

            return rs;
        }
    })()
);

/* ------- c99m-util-02-border-table-recognise ------- */
// 如果不是表格，返回0，否则返回开始列号（第一个有上线的单元格所在列）
bus.on("边框表格首行开始列", (sheet, oSheet, row) => {
    if (oSheet.maxHeadRow && row === oSheet.maxHeadRow + 1) return 0; // 有表头时，表头的下一行不能是表格

    for (let column = 1; column <= oSheet.maxColumn; column++) {
        if (bus.at("左边框线", sheet, oSheet, row, column) && bus.at("上边框线", sheet, oSheet, row, column)) {
            return column; // 简化，见有左边框线和上就行
        }
    }
    return 0;
});

bus.on("边框表格结束行", (sheet, oSheet, iStartRow, iStartColumn) => {
    for (let row = iStartRow; row <= oSheet.maxRow; row++) {
        if (iStartColumn === 1) {
            if (!bus.at("下边框线", sheet, oSheet, row, iStartColumn)) {
                return row - 1; // 简化，见有左边框线就行
            }
        } else {
            if (!bus.at("左边框线", sheet, oSheet, row, iStartColumn)) {
                return row - 1; // 简化，见有左边框线就行
            }
        }
    }
    return iStartRow;
});

bus.on("边框表格结束列", (sheet, oSheet, iStartRow, iStartColumn) => {
    for (let column = iStartColumn; column <= oSheet.maxColumn; column++) {
        if (!bus.at("上边框线", sheet, oSheet, iStartRow, column)) {
            return column - 1; // 简化，见有上边框线就行
        }
    }
    return iStartColumn;
});

// 取出边框表格的全部单元格位置（最终结构效果如同Table的Tr）
bus.on(
    "边框表格全部行位置",
    (function () {
        return function (sheet, oSheet, iRow, iColumn, maxRow, maxColumn) {
            if (!iRow || !iColumn) return []; // 参数不对

            let oSet = new Set(); // 存放已被找出占用的单元格
            let positions = [],
                aryTr = [];
            let oPos = bus.at("边框单元格位置", sheet, oSheet, iRow, iColumn, maxRow, maxColumn);
            if (oPos) {
                aryTr.push(oPos);
                saveFoundCell(oSet, oPos); // 缓存已被找出来的单元格
                positions.push(aryTr);
            } else {
                return positions; // 根本就不是表格
            }

            // 第一行直接按右边紧邻关系，找出首行的全部边框单元格
            while ((oPos = bus.at("右边框单元格位置", sheet, oSheet, oPos, maxRow, maxColumn))) {
                saveFoundCell(oSet, oPos); // 缓存已被找出来的单元格
                aryTr.push(oPos);
            }

            // 接下去从第二行开始逐行递增，遍历全部单元格，逐个确认找出所有边框单元格
            for (let row = iRow + 1, tr; row <= maxRow; row++) {
                tr = getRowBorderCells(sheet, oSheet, oSet, row, iColumn, maxRow, maxColumn); // 一个不落的找
                tr.length && positions.push(tr); // 该行有才推入数组
            }

            return positions;
        };

        // 指定行逐个确认查找边框单元格
        function getRowBorderCells(sheet, oSheet, oSet, row, iColumn, maxRow, maxColumn) {
            let cells = [];
            for (let column = iColumn, oPos; column <= maxColumn; column++) {
                if (oSet.has(`${row},${column}`)) continue; // 跳过已找出来的单元格

                oPos = bus.at("边框单元格位置", sheet, oSheet, row, column, maxRow, maxColumn);
                saveFoundCell(oSet, oPos); // 缓存已被找出来的单元格
                oPos && cells.push(oPos);
            }
            return cells;
        }

        // 缓存已被找出来的单元格
        function saveFoundCell(oSet, oPos) {
            if (!oPos) return;

            for (let row = oPos.startRow; row <= oPos.endRow; row++) {
                for (let column = oPos.startColumn; column <= oPos.endColumn; column++) {
                    oSet.add(`${row},${column}`); // 这个单元格已被找出来了
                }
            }
        }
    })()
);

// 查找紧邻右边的边框单元格位置（仅限简易二维表格）
bus.on("右边框单元格位置", (sheet, oSheet, oPos, maxRow, maxColumn) => {
    if (!oPos) return null;

    return bus.at("边框单元格位置", sheet, oSheet, oPos.startRow, oPos.endColumn + 1, maxRow, maxColumn);
});

// 通过边框线判断所在边框单元格位置（参数位置应该是边框单元格的起始位置）
bus.on("边框单元格位置", (sheet, oSheet, iRow, iColumn, maxRow, maxColumn) => {
    if (!iRow || !iColumn) {
        return null; // 参数不对
    }

    let startRow = iRow;
    let endRow = 0;
    let startColumn = iColumn;
    let endColumn = 0;

    // -----------------------------------------------------------------
    // 传入的地址属于合并单元格的起始位置，直接用合并单元格的位置信息
    // -----------------------------------------------------------------
    let mergeAddr = bus.at("所属合并单元格的位置", oSheet, iRow, iColumn);
    if (mergeAddr) {
        endRow = mergeAddr.endRow;
        endColumn = mergeAddr.endColumn;
        return { startRow, endRow, startColumn, endColumn }; // 既然合并了单元格，理应有边框线，不必再看，直接返回
    }

    // -----------------------------------------------------------------
    // 不是合并单元格，逐个单元格判断边框线决定
    // -----------------------------------------------------------------
    for (let row = startRow, max = maxRow || startRow + 100; row <= max; row++) {
        if (bus.at("下边框线", sheet, oSheet, row, startColumn)) {
            endRow = row; // 找到结束行
            break;
        }
    }
    if (!endRow) return null; // 找不到边框线，返回null

    for (let column = startColumn, max = maxColumn || startColumn + 100; column <= max; column++) {
        if (bus.at("右边框线", sheet, oSheet, startRow, column)) {
            endColumn = column; // 找到结束列
            break;
        }
    }
    if (!endColumn) return null; // 找不到边框线，返回null

    return { startRow, endRow, startColumn, endColumn };
});

/* ------- c99m-util-03-merge-cell-recognise ------- */
// 给定一个单元格地址，找出其所属的合并单元格地址，没有则返回空
bus.on("所属合并单元格的位置", (oSheet, iRow, iColumn) => {
    if (!iRow || !iColumn) {
        return null; // 参数不对
    }

    let map = oSheet.mapMergeCell;
    let addr = bus.on("数字转列名", iColumn) + iRow;
    if (map.has(addr)) {
        return map.get(addr); // 按合并单元格起始地址直接找到
    }

    for (let oAddr of map.values()) {
        // 遍历合并单元格，确认是否在其中
        if (iRow >= oAddr.startRow && iRow <= oAddr.endRow && iColumn >= oAddr.startColumn && iColumn <= oAddr.endColumn) {
            return oAddr; // 找到
        }
    }

    return null; // 找不到
});

// 判断是否属于某个合并单元格的起始单元格位置，是的话返回地址信息
bus.on("是否合并单元格起始位置", (oSheet, iRow, iColumn) => {
    if (!iRow || !iColumn) {
        return false; // 参数不对
    }

    let map = oSheet.mapMergeCell;
    let addr = bus.at("数字转列名", iColumn) + iRow;
    return map.get(addr);
});

/* ------- c99m-util-04-cell-background-recognise ------- */
bus.on("单元格背景色", (sheet, oSheet, iRow, iColumn) => {
    if (!iRow || !iColumn) {
        return null; // 参数不对
    }

    let map = oSheet.mapMergeCell;
    let addr = bus.on("数字转列名", iColumn) + iRow;
    if (map.has(addr)) {
        return map.get(addr); // 按合并单元格起始地址直接找到
    }

    let oCell = sheet.cell(addr.cell);

    return oCell; // 找不到
});

/* ------- d11p-sheet-parse-sections ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 读取Sheet的【章节】
        return postobject.plugin(/**/ __filename /**/, function (root, context) {
            for (let i = 0, oSheet, sheet; (oSheet = context.Sheets[i++]); ) {
                if (oSheet.ignore) continue; // 跳过忽略的Sheet

                sheet = context.workbook.sheet(oSheet.name);
                oSheet.Sections = bus.at("读取章节", sheet, oSheet);
            }
        });
    })()
);

/* ------- d21p-excel-close ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 释放部分属性
        return postobject.plugin(/**/ __filename /**/, function (root, context) {
            delete context.workbook;
            // delete context.Sheets; // 测试代码中使用，删除将导致测试出错
        });
    })()
);

/* ------- d99m-util-01-sheet-section-no-recognise ------- */
bus.on("章节编号", function (oVal) {
    if (!oVal || !oVal.value) return null;

    let str = (oVal.value + "").trim();
    let match = str.match(
        /^[0-9１２３４５６７８９０一二三四五六七八九〇ⅠⅡⅢⅣⅤⅥⅦⅧⅨ㈠㈡㈢㈣㈤㈥㈦㈧㈨⒈⒉⒊⒋⒌⒍⒎⒏⒐Ⅺ⒑㈩⑽]+[0-9１２３４５６７８９０一二三四五六七八九〇ⅠⅡⅢⅣⅤⅥⅦⅧⅨ㈠㈡㈢㈣㈤㈥㈦㈧㈨⒈⒉⒊⒋⒌⒍⒎⒏⒐Ⅺ⒑㈩⑽.．－-]*/
    );
    if (!match) return null;

    let oNum = {
        "１": "1",
        一: "1",
        Ⅰ: "1",
        "⑴": "1",
        "㈠": "1",
        "⒈": "1",
        "２": "2",
        二: "2",
        Ⅱ: "2",
        "⑵": "2",
        "㈡": "2",
        "⒉": "2",
        "３": "3",
        三: "3",
        Ⅲ: "3",
        "⑶": "3",
        "㈢": "3",
        "⒊": "3",
        "４": "4",
        四: "4",
        Ⅴ: "4",
        "⑷": "4",
        "㈣": "4",
        "⒋": "4",
        "５": "5",
        五: "5",
        Ⅵ: "5",
        "⑸": "5",
        "㈤": "5",
        "⒌": "5",
        "６": "6",
        六: "6",
        Ⅶ: "6",
        "⑹": "6",
        "㈥": "6",
        "⒍": "6",
        "７": "7",
        七: "7",
        Ⅷ: "7",
        "⑺": "7",
        "㈦": "7",
        "⒎": "7",
        "８": "8",
        八: "8",
        Ⅸ: "8",
        "⑻": "8",
        "㈧": "8",
        "⒏": "8",
        "９": "9",
        九: "9",
        Ⅹ: "9",
        "⑼": "9",
        "㈨": "9",
        "⒐": "9",
        "０": "0",
        〇: "0",
        Ⅺ: "10",
        "⒑": "10",
        "㈩": "10",
        "⑽": "10",
    };

    let strMatch = match[0]
        .split("")
        .map((ch) => (oNum[ch] ? oNum[ch] : ch))
        .join(""); // 数字统一替换为半角数字
    strMatch = strMatch.replace(/[.．－]+/g, "-"); // 分隔符统一替换为半角减号

    let ary = strMatch.split("-");
    ary = ary.map((v) => (100 + (v - 0) + "").substring(1)); // 每段统一2位长度
    //while (ary.length < 5) ary.push('00');                                                        // 统一为5段，便于字符串方式比较
    let seq = ary.join("-");
    let cell = oVal.cell;

    return { cell, seq, orig: match[0] };
});

/* ------- d99m-util-02-sheet-sections-origin ------- */
bus.on("读取章节", function (sheet, oSheet) {
    let contents = bus.at("顺序通读", sheet, oSheet);
    // console.info( JSON.stringify(contents,null,2))
    return bus.at("整理章节", sheet, oSheet, contents);
});

bus.on("顺序通读", function (sheet, oSheet) {
    let iStartColumn,
        aryVal,
        contents = [];

    for (let row = oSheet.maxHeadRow + 1; row <= oSheet.maxRow; row++) {
        iStartColumn = bus.at("边框表格首行开始列", sheet, oSheet, row);
        if (iStartColumn) {
            aryVal = bus.at("读边框表格", sheet, oSheet, row, iStartColumn); // 表格对象
            row = aryVal.endRow; // 表格末行
        } else {
            aryVal = bus.at("读行单元格", sheet, oSheet, row); // 返回数组
        }

        contents.push(aryVal);
    }

    let rs = [];
    for (let i = 0, aryLine; i < contents.length; i++) {
        aryLine = contents[i];

        if (aryLine.length || aryLine.endRow) {
            if (aryLine.length === 1 && aryLine[0].delete) {
                continue; // 过滤删除行
            }
            rs.push(aryLine);
        } else {
            rs[rs.length - 1] && (rs[rs.length - 1].length || rs[rs.length - 1].endRow) && rs.push(aryLine); // 重复空行仅保留一行
        }
    }

    rs = bus.at("同段文本合并", rs);
    rs = rs.filter((v) => v && (!v.values || v.values.length)); // 过滤没有内容文本章节

    // TODO 表格的头部脚部文本，表头识别
    return rs;
});

bus.on("同段文本合并", function (contents) {
    if (!contents.length) return [];

    let rs = [],
        oSec,
        values;
    for (let i = 0; i < contents.length; i++) {
        values = contents[i];
        if (values) {
            if (values.endRow) {
                rs.push({ table: values.trs, endRow: values.endRow, startColumn: values.startColumn }); // 表格
                oSec = null;
            } else if (values.length) {
                if (!oSec) {
                    rs.push((oSec = { values })); // 起始文本章节
                } else {
                    if (bus.at("章节编号", values[0])) {
                        rs.push((oSec = { values })); // 有章节编号，按新章节处理
                    } else {
                        oSec.values.push(...values); // 没有章节编号的做合并处理
                    }
                }
            } else {
                rs.push((oSec = null)); // 空行
            }
        } else {
            rs.push((oSec = null)); // 空行
        }
    }

    return rs;
});

bus.on("读边框表格", function (sheet, oSheet, iStartRow, iStartColumn) {
    let maxRow = bus.at("边框表格结束行", sheet, oSheet, iStartRow, iStartColumn);
    let maxColumn = bus.at("边框表格结束列", sheet, oSheet, iStartRow, iStartColumn);

    let trs = bus.at("边框表格全部行位置", sheet, oSheet, iStartRow, iStartColumn, maxRow, maxColumn);
    let startColumn = trs[0][0].startColumn;
    let endRow = trs[trs.length - 1][0].endRow;

    for (let i = 0, tds; (tds = trs[i++]); ) {
        for (let j = 0, td; (td = tds[j++]); ) {
            td.Value = bus.at("读值", sheet, oSheet, td.startRow, td.startColumn);
        }
    }

    for (let i = 0; i < trs.length; i++) {
        trs[i].length === 1 && trs[i][0].delete && (trs[i] = null);
    }
    trs = trs.filter((tr) => !!tr); // 过滤删除行

    return { trs, endRow, startColumn };
});

bus.on("读行单元格", function (sheet, oSheet, row) {
    let values = [],
        oDelete = null;
    for (let column = 1, oVal; column <= oSheet.maxColumn; column++) {
        oVal = bus.at("读值", sheet, oSheet, row, column);
        oVal.value.trim() && values.push(oVal);
        !oDelete && oVal.delete && (oDelete = oVal);
    }

    if (values.length) {
        return values; // 正常有值时返回的是数组
    } else if (oDelete) {
        return [oDelete]; // 删除行时，数组仅含首个删除单元格
    } else {
        return values; // 空行时返回的是空数组
    }
});

/* ------- d99m-util-03-sheet-sections-tree ------- */
bus.on("整理章节", function (sheet, oSheet, contents) {
    let oRoot = {};
    for (let i = 0; i < contents.length; i++) {
        i = bus.at("整理子章节", oRoot, contents, i);
    }
    return oRoot;
});

bus.on("整理子章节", function (oParent, contents, index) {
    !oParent.nodes && (oParent.nodes = []);

    let oSec;
    for (let i = index, oItem; (oItem = contents[i++]); ) {
        oSec = { ...oItem };
        oSec.values && (oSec.Seq = bus.at("章节编号", oSec.values[0]));

        // 找到父章节，并添加为父章节的子章节
        let oSuper = oParent;
        let iColSec, iColParent;
        while (oSuper) {
            if (!oSuper.parent) {
                oSec.parent = () => oSuper;
                oSuper.nodes.push(oSec); // 根节点了，直接添加为子章节
                break;
            }

            if (oSuper.table) {
                oSuper = oSuper.parent();
                continue; // 表格没有子章节，继续找上级章节
            }
            if (oSec.table) {
                oSec.parent = () => oSuper;
                oSuper.nodes.push(oSec); // 如果是表格，直接按子章节处理
                break;
            }

            if (oSec.Seq && oSuper.Seq) {
                if (oSec.Seq.seq.length > oSuper.Seq.seq.length) {
                    // 章节号更深，按子章节处理
                    oSec.parent = () => oSuper;
                    oSuper.nodes.push(oSec);
                    break;
                } else if (oSec.Seq.seq.length === oSuper.Seq.seq.length) {
                    // 章节号同级，继续找上级章节
                    oSuper = oSuper.parent();
                    continue;
                } else {
                    // 章节号更浅，还得再看看
                    if (oSec.Seq.seq.length === 2) {
                        iColSec = bus.at("地址起始列数字", oSec.values[0].cell);
                        iColParent = bus.at("地址起始列数字", oSuper.values[0].cell);
                        if (iColSec > iColParent) {
                            oSec.parent = () => oSuper;
                            oSuper.nodes.push(oSec); // 缩进的单章节号，按子章节处理（如1-2下的缩进的1按1-2-1看待）
                            break;
                        }
                    }
                }
            } else {
                iColSec = bus.at("地址起始列数字", oSec.values[0].cell);
                iColParent = bus.at("地址起始列数字", oSuper.values[0].cell);
                if (iColSec > iColParent) {
                    oSec.parent = () => oSuper;
                    oSuper.nodes.push(oSec); // 没有章节号时，按缩进对齐方式判断是否子章节（比较首个单元格位置）
                    break;
                }
            }

            oSuper = oSuper.parent(); // 继续找上级章节
        }

        return bus.at("整理子章节", oSec, contents, i); // 继续按顺序整理
    }
});

/* ------- e11p-parse-result ------- */
bus.on(
    "阅读器插件",
    (function () {
        // 整理有效Sheet的内容存入context.result
        return postobject.plugin(/**/ __filename /**/, function (root, context) {
            let oExcel = { type: SheetType.Excel, file: context.input.file, nodes: [] };

            for (let i = 0, oSheet, sheet; (oSheet = context.Sheets[i++]); ) {
                if (oSheet.ignore) continue; // 跳过忽略的Sheet

                let type = oSheet.type;
                let name = oSheet.name;
                let nodes = [];
                oExcel.nodes.push({ type, name, nodes }); // Sheet

                nodes.push({ type: SheetType.SheetHead, header: oSheet.Head }); // SheetHead
                oSheet.Sections && oSheet.Sections.nodes && nodes.push(...oSheet.Sections.nodes); // Sections
            }

            context.result = oExcel;
        });
    })()
);

/* ------- z99m-utils ------- */
// 工具函数
bus.on("空白", function (val) {
    return !val || /^\s*$/.test(val);
});
bus.on("非空白", function (val) {
    return !bus.at("空白", val);
});

bus.on("正则转义", function (str) {
    return str.replace(/[|\\{}()[\]^$+*?.-]/g, "\\$&");
});

bus.on(
    "查找引号内容",
    (function () {
        const aryLeft = [`“`, `【`, `〖`, `『`, `《`, `「`, `［`, `[`, `'`, `"`, `‘`, `《`];
        const aryRight = [`”`, `】`, `〗`, `』`, `》`, `」`, `］`, `]`, `'`, `"`, `’`, `》`];

        // 可指定起始字符
        return function (str, cLeft, cRight) {
            let idxLeft, idxRight;

            // 指定起始字符时，按指定的查找
            if (cLeft && cRight) {
                idxLeft = str.indexOf(cLeft);
                if (idxLeft < 0) return null;

                idxRight = str.indexOf(cRight, idxLeft + cLeft.length);
                if (idxRight < 0) return null;

                // 前一字符是反斜杠时继续往后找
                while (str.substring(idxRight - 1, idxRight) === "\\") {
                    idxRight = str.indexOf(cRight, idxRight + cRight.length);
                    if (idxRight < 0) return null;
                }

                return str.substring(idxLeft, idxRight + cRight.length);
            }

            // 未指定起始字符时，按默认规则查找
            for (let i = 0, ch; (ch = aryLeft[i++]); ) {
                idxLeft = str.indexOf(ch);
                if (idxLeft < 0) continue;

                idxRight = str.indexOf(aryRight[i - 1], idxLeft + 1);
                if (idxRight < 0) continue;

                // 前一字符是反斜杠时继续往后找
                while (str.substring(idxRight - 1, idxRight) === "\\") {
                    idxRight = str.indexOf(cRight, idxRight + cRight.length);
                    if (idxRight < 0) return null;
                }

                return str.substring(idxLeft, idxRight + 1);
            }
            return null;
        };
    })()
);

bus.on(
    "句型转正则",
    (function () {
        const aryKey = "⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛".split(""); // 临时替代引号内容的特殊字符

        return function (sentencePattern) {
            if (typeof sentencePattern !== "string" || !sentencePattern) {
                return null;
            }

            let pattern = sentencePattern;
            let oReplace = {};
            let match,
                idx = 0;

            // 中括号内容处理
            while ((match = bus.at("查找引号内容", pattern, "[", "]"))) {
                // 查取中括号内容
                pattern = pattern.replace(match, aryKey[idx]); // 替换中括号内容： aaa[nnn]bbb[xxx]ccc -> aaa⒈bbb[xxx]ccc

                let ary = match.substring(1, match.length - 1).split("/"); // 去除两边中括号，内容按斜杠分割
                for (let i = 0; i < ary.length; i++) {
                    ary[i] = bus.at("正则转义", ary[i]); // 分割内容按正则语法转义
                }

                match = "(?:" + ary.join("|") + ")?"; // 中括号内容转正则字符串： [nnn/xxx/yyy] -> (?:nnn|xxx|yyy)?
                oReplace[aryKey[idx]] = match; // 保存正则字符串： ⒈ : (?:nnn|xxx|yyy)?
                idx++;
            }

            // 省略号处理
            let sTmp,
                aryPattern = pattern.split(/\s?…\s?/);
            for (let i = 0; i < aryPattern.length; i++) {
                let ary = aryPattern[i].split(/[⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛]/);
                for (let j = 0; j < ary.length; j++) {
                    let aryTmp = ary[j].split("/");
                    sTmp = "";
                    let hasOr = false;
                    for (let k = 0; k < aryTmp.length; k++) {
                        if (k === aryTmp.length - 1) {
                            sTmp += bus.at("正则转义", aryTmp[k]);
                        } else {
                            if (
                                /[0-9１２３４５６７８９０/]\s*$/.test(aryTmp[k]) || // 斜杠前跟着的是数字或斜杠
                                /^\s*[0-9１２３４５６７８９０/]/.test(aryTmp[k + 1])
                            ) {
                                // 斜杠后跟着的是数字或斜杠
                                sTmp += bus.at("正则转义", aryTmp[k] + "/"); // 按正常斜杠看待
                            } else {
                                sTmp += bus.at("正则转义", aryTmp[k]) + "|"; // 斜杠是或的意思，转义成正则语法字符
                                hasOr = true;
                            }
                        }
                    }
                    hasOr && (sTmp = "(?:" + sTmp + ")+"); // aaa|bbb -> (?:aaa|bbb)+

                    ary[j] = sTmp; // 转义后的正则字符串
                }

                sTmp = "";
                for (let j = 0; j < ary.length; j++) {
                    if (j === ary.length - 1) {
                        sTmp += ary[j];
                    } else {
                        sTmp += ary[j] + oReplace[aryKey[j]]; // 还原中括号
                    }
                }

                aryPattern[i] = sTmp;
            }

            sTmp = "^" + aryPattern.join("\\s?(.+?)\\s?") + "$"; // 非贪婪模式匹配
            return new RegExp(sTmp);
        };
    })()
);
