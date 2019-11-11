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
                let plugins = bus.on("编程插件");
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
                let plugins = bus.on("编程插件");
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

/* ------- b41p-excel-get-sheet-max-row-column ------- */
(() => {
    // ------- b41p-excel-get-sheet-max-row-column start

    bus.on(
        "编程插件",
        (function() {
            // 读取Sheet的最大行数列数备用
            return postobject.plugin("b41p-excel-get-sheet-max-row-column", function(root, context) {
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

    // ------- b41p-excel-get-sheet-max-row-column end
})();

/* ------- b43p-excel-get-sheet-head-max-column ------- */
(() => {
    // ------- b43p-excel-get-sheet-head-max-column start

    bus.on(
        "编程插件",
        (function() {
            // 识别【表头最大列】
            return postobject.plugin("b43p-excel-get-sheet-head-max-column", function(root, context) {
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
            if (hasRightBorder(sheet, i)) {
                return i; // 第一行最后一个有右边框线的列就是表头的最后列
            }
        }
        return 0;
    }

    function hasRightBorder(sheet, iColumn) {
        let curCell = sheet.row(1).cell(iColumn);
        let nextCell = sheet.row(1).cell(iColumn + 1);
        return !!curCell.style("border").right || !!nextCell.style("border").left; // 当前单元格有右线，或下一列单元格有左线
    }

    // ------- b43p-excel-get-sheet-head-max-column end
})();

/* ------- b45p-excel-get-sheet-head-max-row ------- */
(() => {
    // ------- b45p-excel-get-sheet-head-max-row start

    bus.on(
        "编程插件",
        (function() {
            // 识别【表头最大行】
            return postobject.plugin("b45p-excel-get-sheet-head-max-row", function(root, context) {
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
            hasBottomBorder(sheet, i, oSheet.maxHeadColumn) && rows.push(i);
        }

        // 最后一个全有底线的行就是表头结束行了
        for (let iRow; (iRow = rows.pop()); ) {
            if (hasFullRowBottomBorder(sheet, iRow, oSheet.maxHeadColumn)) {
                return iRow;
            }
        }

        return 0;
    }

    // 判断指定单元格有没有底线
    function hasBottomBorder(sheet, iRow, maxColumn) {
        let curCell = sheet.row(iRow).cell(maxColumn);
        let nextCell = sheet.row(iRow + 1).cell(maxColumn);
        return !!curCell.style("border").bottom || !!nextCell.style("border").top; // 当前单元格有底线，或下一行单元格有上线
    }

    // 判断是否整行都有底线
    function hasFullRowBottomBorder(sheet, iRow, maxColumn) {
        if (iRow < 1 || maxColumn < 1) return false;

        for (let iColumn = maxColumn; iColumn > 0; iColumn--) {
            if (!hasBottomBorder(sheet, iRow, iColumn)) {
                return false;
            }
        }
        return true;
    }

    // ------- b45p-excel-get-sheet-head-max-row end
})();

/* ------- b51p-excel-parse-sheet-head ------- */
(() => {
    // ------- b51p-excel-parse-sheet-head start

    bus.on(
        "编程插件",
        (function() {
            // 解析Sheet【表头】
            return postobject.plugin("b51p-excel-parse-sheet-head", function(root, context) {
                for (let i = 0, oSheet; (oSheet = context.Sheets[i++]); ) {
                    if (oSheet.ignore) continue; // 跳过忽略的Sheet

                    parseSheetHead(context, oSheet);
                }
            });
        })()
    );

    function parseSheetHead(context, oSheet) {
        let val,
            oHead = {};
        let sheet = context.workbook.sheet(oSheet.name);

        for (let i = 1; i < oSheet.maxHeadRow; i++) {
            for (let j = 1; j < oSheet.maxHeadColumn; j++) {
                val = sheet
                    .row(i)
                    .cell(j)
                    .value();
                val !== undefined && (oHead[`${i},${j}`] = val); // TODO 有值的都存起来
            }
        }
        oSheet.Head = oHead;
    }
    // ------- b51p-excel-parse-sheet-head end
})();

/* ------- b61p-excel-parse-sheet-main-sections ------- */
(() => {
    // ------- b61p-excel-parse-sheet-main-sections start

    bus.on(
        "编程插件",
        (function() {
            // 解析Sheet的【章节】
            return postobject.plugin("b61p-excel-parse-sheet-main-sections", function(root, context) {
                let sestions = [];
                let oSheet, sheet, startRow, endRow, startColumn, endColumn, oCell, isTableCell;
                for (let i = 0; (oSheet = context.Sheets[i++]); ) {
                    if (oSheet.ignore) continue; // 跳过忽略的Sheet

                    sheet = context.workbook.sheet(oSheet.name);
                    startRow = oSheet.maxHeadRow + 1; // 开始行
                    endRow = oSheet.maxRow; // 结束行
                    startColumn = 1; // 开始列
                    endColumn = oSheet.maxHeadColumn; // 结束列

                    oCell = getSestionStartRow(sheet, startRow, endRow, startColumn, endColumn); // 主章节起始单元格
                    isTableCell = isCellInTable(sheet, oSheet, oCell); // 是不是表格中的单元格
                    if (isTableCell) {
                        let oTableRange = getTableRange(sheet, oSheet, oCell); // 表格的起始单元格
                        sestions.push(oTableRange); // TODO
                    } else {
                        let aryCells = parseSestionText(sheet, oSheet, oCell); // 章节文本
                        sestions.push(aryCells);
                    }

                    oSheet.Sestions = sestions;
                }
            });
        })()
    );

    // 读取文本章节
    function parseSestionText(sheet, oSheet, oCell) {
        let value,
            rs = [];
        for (let row = oCell.row, max = oCell.row + 30, cells; row < max; row++) {
            cells = [];
            for (let column = oCell.column; column <= oSheet.maxHeadColumn; column++) {
                value = sheet
                    .row(row)
                    .cell(column)
                    .value();
                bus.at("isNotBlank", value) && cells.push({ row, column, value });
            }

            if (!cells.length) break;
            rs.push(...cells);
        }
        return rs;
    }

    // 在指定的表格行中，找出表格的起始行列范围
    function getTableRange(sheet, oSheet, oCell) {
        let startRow = oCell.row,
            endRow,
            startColumn,
            endColumn;

        // 第一个看起来有左边框的单元格，就是开始列
        for (let column = 2; column < oSheet.maxHeadColumn; column++) {
            if (
                sheet
                    .row(startRow)
                    .cell(column)
                    .style("border").left ||
                sheet
                    .row(startRow)
                    .cell(column - 1)
                    .style("border").right
            ) {
                startColumn = column;
                break;
            }
        }
        // 最后一个看起来有右边框的单元格，就是结束列
        for (let column = oSheet.maxHeadColumn - 1; column > 1; column--) {
            if (
                sheet
                    .row(startRow)
                    .cell(column)
                    .style("border").right ||
                sheet
                    .row(startRow)
                    .cell(column + 1)
                    .style("border").left
            ) {
                endColumn = column;
                break;
            }
        }
        // 最后一个看起来有底线的单元格，所在就是结束行
        for (let row = startRow; row < oSheet.maxRow; row++) {
            if (
                sheet
                    .row(row)
                    .cell(startColumn)
                    .style("border").bottom ||
                sheet
                    .row(row)
                    .cell(startColumn + 1)
                    .style("border").top
            ) {
                endRow = row;
                break;
            }
        }

        return { startRow, endRow, startColumn, endColumn };
    }

    // 判断指定单元是否在表格中（当前行有竖线）
    function isCellInTable(sheet, oSheet, oCell) {
        // 通常起始单元格有左边框
        if (
            sheet
                .row(oCell.row)
                .cell(oCell.column)
                .style("border").left
        ) {
            return true;
        }

        // 除去Sheet页左右边框线外，发现竖向边框就算是
        for (let i = 1; i < oSheet.maxHeadColumn; i++) {
            if (
                sheet
                    .row(oCell.row)
                    .cell(oCell.column)
                    .style("border").right
            ) {
                return true;
            }
        }

        return false;
    }

    // 在指定范围内找出非空白的起始单元格
    function getSestionStartRow(sheet, iStartRow, iEndRow, iStartColumn, iEndColumn) {
        for (let row = iStartRow, value; row < iEndRow; row++) {
            for (let column = iStartColumn; column <= iEndColumn; column++) {
                value = sheet
                    .row(row)
                    .cell(column)
                    .value();
                if (bus.at("isNotBlank", value)) {
                    return { row, column };
                }
            }
        }
        return null; // 找不到返回null
    }

    // ------- b61p-excel-parse-sheet-main-sections end
})();

/* ------- b98p-------log ------- */
(() => {
    // ------- b98p-------log start

    bus.on(
        "编程插件",
        (function() {
            return postobject.plugin("b98p-------log", function(root, context) {
                console.info(context.Sheets);
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
(() => {
    // ------- z99m-utils start

    // 工具函数
    bus.on("isBlank", function(val) {
        return !val || /^\s*$/.test(val);
    });
    bus.on("isNotBlank", function(val) {
        return !bus.at("isBlank", val);
    });

    // ------- z99m-utils end
})();

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
