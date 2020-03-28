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

/* ------- z99m-util-001-is-ignore-sheet ------- */
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

/* ------- z99m-util-002-get-sheet-type ------- */
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
