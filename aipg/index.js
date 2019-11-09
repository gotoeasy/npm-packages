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

/* ------- b01p-init-context ------- */
(() => {
    // ------- b01p-init-context start

    bus.on(
        "编程插件",
        (function() {
            // 处理输入文件（单个源文件的单一节点），输入{file，hashcode}
            return postobject.plugin("b01p-init-context", async function(root, context) {
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

    // ------- b01p-init-context end
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

/* ------- b13p-excel-get-document-properties ------- */
(() => {
    // ------- b13p-excel-get-document-properties start

    bus.on(
        "编程插件",
        (function() {
            // 读取Excel文档属性，存放至context.documentProperties备用
            return postobject.plugin("b13p-excel-get-document-properties", async function(root, context) {
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

    // ------- b13p-excel-get-document-properties end
})();

/* ------- b15p-excel-get-excel-sheets ------- */
(() => {
    // ------- b15p-excel-get-excel-sheets start

    bus.on(
        "编程插件",
        (function() {
            // 读取Excel文档属性，存放至context.documentProperties备用
            return postobject.plugin("b15p-excel-get-excel-sheets", function(root, context) {
                let Sheets = [];
                for (let i = 0, sheet, name, type = "Sheet"; (sheet = context.workbook.sheet(i++)); ) {
                    name = sheet.name();
                    Sheets.push({ type, name });
                }
                context.Sheets = Sheets;

                console.log(Sheets);
            });
        })()
    );

    // ------- b15p-excel-get-excel-sheets end
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
