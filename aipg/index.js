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

                return result;
            };
        })()
    );

    // ------- a00m-aipg-env end
})();

/* ------- a30m-aipg-by-excel ------- */
(() => {
    // ------- a30m-aipg-by-excel start

    bus.on(
        "自动编程",
        (function() {
            return function(file) {
                let plugins = bus.on("编程插件");
                let context = postobject(plugins).process({ file });
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
        "编译插件",
        (function() {
            // 处理输入文件（单个源文件的单一节点），输入{file，hashcode}
            return postobject.plugin("b01p-init-context", function(root, context) {
                context.input = {}; // 存放输入（file，hashcode）
                context.result = {}; // 存放结果

                // 保存原始输入（file、hashcode）
                root.walk(
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
