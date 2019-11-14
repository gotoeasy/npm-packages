const bus = require("@gotoeasy/bus");
const postobject = require("@gotoeasy/postobject");

console.time("load");
/* ------- a00m-aipg-env ------- */
(() => {
    // ------- a00m-aipg-env start

    bus.on(
        "环境",
        (function(result) {
            return function(opts, nocache = false) {
                nocache && (result = null);
                if (result) return result;

                result = {};
                result.clean = !!opts.clean;
                result.release = !!opts.release;
                result.debug = !!opts.debug;
                result.nocache = !!opts.nocache;
                result.build = !!opts.build;
                result.watch = !!opts.watch;

                result.file = opts.file;

                return result;
            };
        })()
    );

    // ------- a00m-aipg-env end
})();

/* ------- a10m-aipg-by-excel-all ------- */
(() => {
    // ------- a10m-aipg-by-excel-all start

    bus.on(
        "全部编写",
        (function() {
            return async function() {
                let env = bus.at("环境");
                let plugins = bus.on("编程插件"); // 用bus.on而不是bus.at
                let context = await postobject(plugins).process({ file: env.file });
                return context;
            };
        })()
    );

    // ------- a10m-aipg-by-excel-all end
})();

/* ------- a30m-aipg-by-excel ------- */
(() => {
    // ------- a30m-aipg-by-excel start

    bus.on(
        "自动编程",
        (function() {
            return async function(file) {
                let plugins = bus.on("编程插件"); // 用bus.on而不是bus.at
                let context = await postobject(plugins).process({ file });
                return context;
            };
        })()
    );

    // ------- a30m-aipg-by-excel end
})();

/* ------- b01p-postobject-init-context ------- */
(() => {
    // ------- b01p-postobject-init-context start

    bus.on(
        "编程插件",
        (function() {
            // 处理输入文件（单个源文件的单一节点），输入{file，hashcode}
            return postobject.plugin("b01p-postobject-init-context", async function(root, context) {
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

    // ------- b01p-postobject-init-context end
})();

/* ------- b11p-excel-open ------- */
(() => {
    // ------- b11p-excel-open start

    bus.on(
        "编程插件",
        (function() {
            // 读取Excel文档
            return postobject.plugin("b11p-excel-open", async function(root, context) {
                // 打开Excel文档，往后使用context.workbook读取Excel内容，读取完后再删除
                let XlsxPopulate = require("xlsx-populate");
                context.workbook = await XlsxPopulate.fromFileAsync(context.input.file);
            });
        })()
    );

    // ------- b11p-excel-open end
})();

/* ------- b21p-excel-get-document-properties ------- */
(() => {
    // ------- b21p-excel-get-document-properties start

    bus.on(
        "编程插件",
        (function() {
            // 读取Excel文档属性，存放至context.documentProperties备用
            return postobject.plugin("b21p-excel-get-document-properties", async function(root, context) {
                let xlsxProperties = require("office-document-properties");
                let promiseProperties = new Promise(resolve => {
                    xlsxProperties.fromFilePath(context.input.file, (err, data) => {
                        resolve(err ? {} : data); // 出错时空内容对象
                    });
                });

                context.documentProperties = await promiseProperties;
            });
        })()
    );

    // ------- b21p-excel-get-document-properties end
})();

/* ------- b31p-excel-get-all-sheets ------- */
(() => {
    // ------- b31p-excel-get-all-sheets start

    bus.on(
        "编程插件",
        (function() {
            // 读取全部Sheet名、是否隐藏等基本信息
            return postobject.plugin("b31p-excel-get-all-sheets", function(root, context) {
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

    // ------- b31p-excel-get-all-sheets end
})();

/* ------- b33p-excel-filter-sheet ------- */
(() => {
    // ------- b33p-excel-filter-sheet start

    bus.on(
        "编程插件",
        (function() {
            // 过滤掉要忽略的Sheet（删除的，隐藏的，等等），添加忽略标记
            return postobject.plugin("b33p-excel-filter-sheet", function(root, context) {
                for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                    if (
                        oSheet.hidden || // 隐藏的Sheet
                        /^\s*[×✖]/.test(oSheet.name) || // Sheet名称用删除符号注明删除
                        /^\s*([【（<＜《(]×[】）＞>》)]|[【（<＜《(]✖[】）＞>》)])/i.test(oSheet.name) || // 括号内删除符号注明删除
                        /^\s*([【（<＜《(]删除[】）＞>》)]|[【（<＜《(]废弃[】）＞>》)]|[【（<＜《(]忽略[】）＞>》)]|[【（<＜《(]无视[】）＞>》)])/i.test(
                            oSheet.name
                        ) || // 文字注明删除
                        /^\s*([【（<＜《(]削除[】）＞>》)]|[【（<＜《(]廃棄[】）＞>》)]|[【（<＜《(]廃止[】）＞>》)]|[【（<＜《(]無視[】）＞>》)])/i.test(
                            oSheet.name
                        ) ||
                        /^\s*([【（<＜《(]delete[】）＞>》)]|[【（<＜《(]ignore[】）＞>》)]|[【（<＜《(]ignored[】）＞>》)])/i.test(oSheet.name) ||
                        /^\s*$/.test(oSheet.name) // Sheet名称空白
                    ) {
                        oSheet.ignore = true;
                    } else {
                        oSheet.ignore = false;
                    }
                }
            });
        })()
    );

    // ------- b33p-excel-filter-sheet end
})();

/* ------- b35p-excel-parse-sheet-type ------- */
(() => {
    // ------- b35p-excel-parse-sheet-type start

    bus.on(
        "编程插件",
        (function() {
            // 根据Sheet名称识别Sheet类型（修订履历、页面布局、页面项目、详细处理、编辑、补足、、、、等等）
            return postobject.plugin("b35p-excel-parse-sheet-type", function(root, context) {
                for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                    if (oSheet.ignore) continue; // 跳过忽略的Sheet

                    oSheet.type = getSheetType(oSheet.name);
                }
            });
        })()
    );

    // SheetVersion : 修订履历
    // SheetPageLayout : 页面布局
    // SheetPageItems : 页面项目
    // SheetProcess : 详细处理
    // SheetEdit : 编辑明细
    // SheetOther : 其他
    function getSheetType(name) {
        if (/^(变更履历|修订履历|修订版本|版本|版本履历)$/.test(name) || /^(変更履歴|改訂履歴)$/.test(name)) {
            return "SheetVersion";
        }

        if (/^(页面设计|页面布局|布局|页面)$/.test(name) || /^(画面仕様|画面レイアウト|画面|レイアウト)$/.test(name)) {
            return "SheetPageLayout";
        }

        if (
            /^(页面项目|页面项目设计|页面项目明细|页面项目说明|项目说明)$/.test(name) ||
            /^(画面アイテム|画面項目|画面アイテム说明|画面項目说明|画面詳細)$/.test(name)
        ) {
            return "SheetPageItems";
        }

        if (/^(详细处理|处理设计|处理说明)$/.test(name) || /^(処理仕様|詳細処理)$/.test(name)) {
            return "SheetProcess";
        }

        if (/^编辑/.test(name) || /^編集/.test(name)) {
            return "SheetTableEdit";
        }

        // 其他
        return "SheetOther";
    }
    // ------- b35p-excel-parse-sheet-type end
})();

/* ------- b37p-excel-parse-merge-cells ------- */
(() => {
    // ------- b37p-excel-parse-merge-cells start

    bus.on(
        "编程插件",
        (function() {
            // 根据Sheet名称识别Sheet类型（修订履历、页面布局、页面项目、详细处理、编辑、补足、、、、等等）
            return postobject.plugin("b37p-excel-parse-merge-cells", function(root, context) {
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
    // ------- b37p-excel-parse-merge-cells end
})();

/* ------- b41p-excel-sheet-get-max-row-column ------- */
(() => {
    // ------- b41p-excel-sheet-get-max-row-column start

    bus.on(
        "编程插件",
        (function() {
            // 读取Sheet的最大行数列数备用
            return postobject.plugin("b41p-excel-sheet-get-max-row-column", function(root, context) {
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

    // ------- b41p-excel-sheet-get-max-row-column end
})();

/* ------- b43p-excel-sheet-get-head-max-column ------- */
(() => {
    // ------- b43p-excel-sheet-get-head-max-column start

    bus.on(
        "编程插件",
        (function() {
            // 识别【表头最大列】
            return postobject.plugin("b43p-excel-sheet-get-head-max-column", function(root, context) {
                for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                    if (oSheet.ignore) continue; // 跳过忽略的Sheet

                    oSheet.maxHeadColumn = guessMaxHeadColumn(context, oSheet); // 表头最大列
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

    // ------- b43p-excel-sheet-get-head-max-column end
})();

/* ------- b45p-excel-sheet-get-head-max-row ------- */
(() => {
    // ------- b45p-excel-sheet-get-head-max-row start

    bus.on(
        "编程插件",
        (function() {
            // 识别【表头最大行】
            return postobject.plugin("b45p-excel-sheet-get-head-max-row", function(root, context) {
                for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                    if (oSheet.ignore) continue; // 跳过忽略的Sheet

                    oSheet.maxHeadRow = guessMaxHeadRow(context, oSheet); // 表头最大行
                }
            });
        })()
    );

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

    // ------- b45p-excel-sheet-get-head-max-row end
})();

/* ------- b47p-excel-sheet-update-max-column ------- */
(() => {
    // ------- b47p-excel-sheet-update-max-column start

    bus.on(
        "编程插件",
        (function() {
            // 修正Sheet的【最大列】范围，以表头最大宽度为准
            return postobject.plugin("b47p-excel-sheet-update-max-column", function(root, context) {
                for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                    oSheet.maxHeadColumn && (oSheet.maxColumn = oSheet.maxHeadColumn);
                }
            });
        })()
    );

    // ------- b47p-excel-sheet-update-max-column end
})();

/* ------- b51p-excel-sheet-parse-head ------- */
(() => {
    // ------- b51p-excel-sheet-parse-head start

    bus.on(
        "编程插件",
        (function() {
            // 解析Sheet【表头】
            return postobject.plugin("b51p-excel-sheet-parse-head", function(root, context) {
                for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                    if (oSheet.ignore) continue; // 跳过忽略的Sheet

                    parseSheetHead(context, oSheet);
                }
            });
        })()
    );

    function parseSheetHead(context, oSheet) {
        let sheet = context.workbook.sheet(oSheet.name);

        let trs = bus.at("边框表格全部行位置", sheet, oSheet, 1, 1, oSheet.maxHeadRow, oSheet.maxHeadColumn);
        let aryHeah = [];
        trs.forEach(tr => {
            let ary = [];
            tr.forEach(td => {
                let tdv = bus.at("读值", sheet, oSheet, td.startRow, td.startColumn);
                tdv && ary.push(tdv);
            });
            ary.length && aryHeah.push(ary);
        });
        oSheet.Head = aryHeah;
    }
    // ------- b51p-excel-sheet-parse-head end
})();

/* ------- b61p-excel-parse-sheet-main-sections ------- */
(() => {
    // ------- b61p-excel-parse-sheet-main-sections start

    bus.on(
        "编程插件",
        (function() {
            // 解析Sheet的【章节】
            return postobject.plugin("b61p-excel-parse-sheet-main-sections", function(root, context) {
                for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                    if (oSheet.ignore) continue; // 跳过忽略的Sheet

                    let sestions = (oSheet.Sestions = []); // 章节数组先存起来

                    let sheet = context.workbook.sheet(oSheet.name);
                    let startRow = oSheet.maxHeadRow + 1; // 开始行
                    let endRow = oSheet.maxRow; // 结束行
                    let startColumn = 1; // 开始列
                    let endColumn = oSheet.maxColumn; // 结束列

                    // 主章节起始单元格
                    let oPos = bus.at("非空白起始单元格", sheet, startRow, endRow, startColumn, endColumn); // 位置对象 {row, column}
                    if (!oPos) continue; // 没内容哦

                    let oTbPos = bus.at("边框表格位置", sheet, oSheet, oPos.row, oPos.column); // 位置对象 {startRow, endRow, startColumn, endColumn}
                    if (oTbPos) {
                        // 表格
                        sestions.push(oTbPos); // TODO
                    } else {
                        // 文字
                        let section = bus.at("读章节文本", sheet, oSheet, oPos);
                        sestions.push(section);
                    }
                }
            });
        })()
    );

    // ------- b61p-excel-parse-sheet-main-sections end
})();

/* ------- b98m-excel-util-01-address-converter ------- */
// ------- b98m-excel-util-01-address-converter start

// 给定一个地址(如A1或A1:B3)，转换为地址对象{addr, startRow, endRow, startColumn, endColumn}
bus.on("地址转换", addr => {
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

bus.on("数字转列名", iColumn => {
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

bus.on("列名转数字", columnName => {
    let sum = 0;
    for (let i = 0; i < columnName.length; i++) {
        sum = sum * 26;
        sum = sum + (columnName[i].charCodeAt(0) - "A".charCodeAt(0) + 1);
    }
    return sum;
});

// ------- b98m-excel-util-01-address-converter end

/* ------- b98m-excel-util-02-first-not-blank-cell-in-range ------- */
// ------- b98m-excel-util-02-first-not-blank-cell-in-range start

// 在指定范围内找出非空白的起始单元格
bus.on("非空白起始单元格", function(sheet, iStartRow, iEndRow, iStartColumn, iEndColumn) {
    for (let row = iStartRow, value; row < iEndRow; row++) {
        for (let column = iStartColumn; column <= iEndColumn; column++) {
            value = sheet
                .row(row)
                .cell(column)
                .value();
            if (bus.at("非空白", value)) {
                return { row, column };
            }
        }
    }
    return null; // 找不到返回null
});

// ------- b98m-excel-util-02-first-not-blank-cell-in-range end

/* ------- b98m-excel-util-03-cell-value-reader ------- */
// ------- b98m-excel-util-03-cell-value-reader start

// -----------------------------------------------------------------------------
// 单元格读值，不是件单纯的事
// 参数可以是（行、列）或（名称地址）或（地址对象）
//
// 1，数字或日期等格式化的单元格 ....... 所见即所得
// 2，公式单元格 ....................... 所见即所得
// 3，富文本单元格 ..................... 人性化读取，要去除删除线文字
// 4，合并单元格 ....................... 人性化读取，合并范围内仅读合并单元格
// 5，线框单元格 ....................... 人性化读取，线框范围内多单元格合并读取
// -----------------------------------------------------------------------------
bus.on(
    "读值",
    (function() {
        return function(sheet, oSheet, iRow, iColumn) {
            if (!iRow) return "";

            let oAddr;
            if (typeof iRow === "string") {
                oAddr = bus.at("地址转换", iRow); // {cell, addr, startRow, endRow, startColumn, endColumn}
            } else if (typeof iRow === "number") {
                if (!iColumn) {
                    return "";
                } else {
                    oAddr = bus.at("地址转换", bus.at("数字转列名", iColumn) + iRow);
                }
            } else {
                oAddr = iRow; // 传入的就是地址对象
            }

            return readCell(sheet, oAddr, oSheet.mapMergeCell.has(oAddr.cell)); // 对象或数组或空串
        };

        // 返回对象或数组或null
        function readCell(sheet, oAddr, isMerged) {
            //let {cell, addr, startRow, endRow, startColumn, endColumn} = oAddr;         // cell:单元格地址
            let { cell } = oAddr; // cell:单元格地址
            let oCell = sheet.cell(cell);
            let value = oCell.value();

            if (value == null) {
                // 转成空串直接返回
                return "";
            } else if (value.get) {
                // 富文本时，检查忽略带删除线的文字
                let txt = "";
                for (let i = 0, fragment; (fragment = value.get(i++)); ) {
                    !fragment.style("strikethrough") && (txt += fragment.value());
                }
                value = txt;
            } else {
                // TODO
                // let fmt = oCell.style('numberFormat');
                //   fmt = oCell.style('fill');  // background
                // fmt && (value += fmt)
            }

            if (value == null) {
                return "";
            }

            if (isMerged) {
                return { cell, value };
            }

            return { cell, value };
        }
    })()
);

// ------- b98m-excel-util-03-cell-value-reader end

/* ------- b98m-excel-util-04-section-text-reader ------- */
// ------- b98m-excel-util-04-section-text-reader start

bus.on(
    "读章节文本",
    (function() {
        // oPos: {row, column}
        return function(sheet, oSheet, oPos) {
            let oValue,
                rows = [];
            let startRow = oPos.row,
                endRow = oPos.row,
                startColumn = oPos.column;

            for (let row = startRow, max = startRow + 30, cells; row < max; row++) {
                cells = [];
                for (let column = oPos.column; column <= oSheet.maxColumn; column++) {
                    oValue = bus.at("读值", sheet, oSheet, row, column);
                    oValue && cells.push(oValue);
                }

                if (!cells.length) {
                    endRow++;
                    break;
                }
                rows.push(cells);
            }

            return { startRow, endRow, startColumn, rows };
        };
    })()
);

// ------- b98m-excel-util-04-section-text-reader end

/* ------- b98m-excel-util-10-border-line-recognise ------- */
// ------- b98m-excel-util-10-border-line-recognise start

// 边框线识别

bus.on("上边框线", function(sheet, oSheet, iRow, iColumn) {
    if (!iRow || !iColumn) {
        return false; // 参数不对
    } else if (
        sheet
            .row(iRow)
            .cell(iColumn)
            .style("border").top
    ) {
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

bus.on("下边框线", function(sheet, oSheet, iRow, iColumn) {
    if (!iRow || !iColumn) {
        return false; // 参数不对
    } else if (
        sheet
            .row(iRow)
            .cell(iColumn)
            .style("border").bottom
    ) {
        return true; // 有的
    } else {
        return sheet
            .row(iRow + 1)
            .cell(iColumn)
            .style("border").top; // 也有的
    }
});

bus.on("左边框线", function(sheet, oSheet, iRow, iColumn) {
    if (!iRow || !iColumn) {
        return false; // 参数不对
    } else if (
        sheet
            .row(iRow)
            .cell(iColumn)
            .style("border").left
    ) {
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

bus.on("右边框线", function(sheet, oSheet, iRow, iColumn) {
    if (!iRow || !iColumn) {
        return false; // 参数不对
    } else if (
        sheet
            .row(iRow)
            .cell(iColumn)
            .style("border").right
    ) {
        return true; // 有的
    } else {
        return sheet
            .row(iRow)
            .cell(iColumn + 1)
            .style("border").left; // 也有的
    }
});

bus.on("全有上边框线", function(sheet, oSheet, iRow, iStartColumn, iEndColumn) {
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

bus.on("全有下边框线", function(sheet, oSheet, iRow, iStartColumn, iEndColumn) {
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

bus.on("全有左边框线", function(sheet, oSheet, iColumn, iStartRow, iEndRow) {
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

bus.on("全有右边框线", function(sheet, oSheet, iColumn, iStartRow, iEndRow) {
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

bus.on("全有边框线", function(sheet, oSheet, iStartRow, iEndRow, iStartColumn, iEndColumn) {
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

// ------- b98m-excel-util-10-border-line-recognise end

/* ------- b98m-excel-util-11-border-table-recognise ------- */
// ------- b98m-excel-util-11-border-table-recognise start

// 边框表格识别（看上去有线框的表格，识别出范围地址）
// 指定一个单元格，判断是否在边框表格中，是的话返回边框表格的位置信息{startRow, endRow, startColumn, endColumn}，否则返回null
// （指定的单元格通常应该是边框表格的首行）
bus.on("边框表格位置", function(sheet, oSheet, iRow, iColumn) {
    if (!iRow || !iColumn) return null;

    // 位置{row, column}
    let oPos = bus.at("非空白起始单元格", sheet, iRow, oSheet.maxRow, iColumn, oSheet.maxColumn);
    if (!oPos) return null;

    if (!bus.at("上边框线", sheet, oSheet, oPos.row, oPos.column)) {
        return null; // 没有上边框线，不是表格（首行应当有上边框线）
    }

    // 有戏，开始找范围
    let startRow, endRow, startColumn, endColumn;
    startRow = endRow = iRow;
    startColumn = endColumn = oPos.column;

    for (let i = startColumn - 1; i > 0; i--) {
        if (bus.at("上边框线", sheet, oSheet, startRow, i)) {
            startColumn = i; // 开始列
        } else {
            break;
        }
    }
    for (let i = startColumn + 1; i <= oSheet.maxHeadColumn; i++) {
        if (bus.at("上边框线", sheet, oSheet, startRow, i)) {
            endColumn = i; // 结束列
        } else {
            break;
        }
    }

    for (let i = startRow + 1; i <= oSheet.maxHeadRow; i++) {
        if (bus.at("左边框线", sheet, oSheet, i, startColumn)) {
            endRow = i; // 结束行
        } else {
            break;
        }
    }

    // TODO 没有左右边框线的表格 ...

    return { startRow, endRow, startColumn, endColumn };
});

// ------- b98m-excel-util-11-border-table-recognise end

/* ------- b98m-excel-util-12-border-table-cell-recognise ------- */
// ------- b98m-excel-util-12-border-table-cell-recognise start

// 边框单元格识别

// 取出边框表格行的整行边框单元格位置（最终结构效果如同Table的Tr）
bus.on("边框表格全部行位置", (sheet, oSheet, iRow, iColumn, maxRow, maxColumn) => {
    if (!iRow || !iColumn) {
        return null; // 参数不对
    }

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
});

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
    if (!endRow) return null; // 找不到边框线，返回null

    return { startRow, endRow, startColumn, endColumn };
});

// ------- b98m-excel-util-12-border-table-cell-recognise end

/* ------- b98m-excel-util-13-border-table-head-recognise ------- */
// ------- b98m-excel-util-13-border-table-head-recognise start

// 边框单元格识别

// 取出边框表格行的整行边框单元格位置（最终结构效果如同Table的Tr）
bus.on("边框表格全部行位置", (sheet, oSheet, iRow, iColumn, maxRow, maxColumn) => {
    if (!iRow || !iColumn) {
        return null; // 参数不对
    }

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
});

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
        if (bus.at("下边框线", sheet, row, startColumn)) {
            endRow = row; // 找到结束行
            break;
        }
    }
    if (!endRow) return null; // 找不到边框线，返回null

    for (let column = startColumn, max = maxColumn || startColumn + 100; column <= max; column++) {
        if (bus.at("右边框线", sheet, startRow, column)) {
            endColumn = column; // 找到结束列
            break;
        }
    }
    if (!endRow) return null; // 找不到边框线，返回null

    return { startRow, endRow, startColumn, endColumn };
});

// ------- b98m-excel-util-13-border-table-head-recognise end

/* ------- b98m-excel-util-21-cell-merge-recognise ------- */
// ------- b98m-excel-util-21-cell-merge-recognise start

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

// ------- b98m-excel-util-21-cell-merge-recognise end

/* ------- b98m-excel-util-22-cell-background-recognise ------- */
// ------- b98m-excel-util-22-cell-background-recognise start

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

// ------- b98m-excel-util-22-cell-background-recognise end

/* ------- b98p-------log ------- */
(() => {
    // ------- b98p-------log start

    bus.on(
        "编程插件",
        (function() {
            return postobject.plugin("b98p-------log", function(root, context) {
                //  console.info(context.Sheets)
                console.info(JSON.stringify(context.Sheets, null, 2));
            });
        })()
    );

    // ------- b98p-------log end
})();

/* ------- b99p-excel-close ------- */
(() => {
    // ------- b99p-excel-close start

    bus.on(
        "编程插件",
        (function() {
            // 删除workbook对象
            return postobject.plugin("b99p-excel-close", function(root, context) {
                delete context.workbook;
            });
        })()
    );

    // ------- b99p-excel-close end
})();

/* ------- z99m-utils ------- */
// ------- z99m-utils start

// 工具函数
bus.on("空白", function(val) {
    return !val || /^\s*$/.test(val);
});
bus.on("非空白", function(val) {
    return !bus.at("空白", val);
});

// ------- z99m-utils end

console.timeEnd("load");

// ------------------------ index ------------------------

const Err = require("@gotoeasy/err");

async function build(opts) {
    let stime = new Date().getTime();

    try {
        bus.at("环境", opts);
        bus.at("clean");

        await bus.at("全部编写");
    } catch (e) {
        console.error(Err.cat("build failed", e).toString());
    }

    let time = new Date().getTime() - stime;
    console.info("build " + time + "ms"); // 异步原因，统一不使用time/timeEnd计时
}

function clean(opts) {
    let stime = new Date().getTime();

    try {
        bus.at("环境", opts);
        bus.at("clean");
    } catch (e) {
        console.error(Err.cat("clean failed", e).toString());
    }

    let time = new Date().getTime() - stime;
    console.info("clean " + time + "ms"); // 异步原因，统一不使用time/timeEnd计时
}

async function watch(opts) {
    await build(opts);
    bus.at("文件监视");
}

module.exports = { build, clean, watch };
