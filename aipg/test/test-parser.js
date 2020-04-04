const test = require("ava");

// ----------------------------------------------
// parser测试
// ----------------------------------------------
const File = require("@gotoeasy/file");
const postobject = require("@gotoeasy/postobject");
const Types = require("../lib/types");
const reader = require("../lib/reader");
const parser = require("../lib/parser");
function writeJson(btfFile, root) {
    let ary = File.read(btfFile).split("-------------------- JSON --------------------");
    ary[1] = JSON.stringify(root, null, 2);
    File.write(btfFile, ary.join("-------------------- JSON --------------------\n"));
}

test("parser: b01p-fix-node-type.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/b01p-fix-node-type.js.xlsx" });

    let opts = {
        "b01p-fix-node-type.js": async (root, context) => {
            await root.walk(
                Types.SheetSection,
                (node, object) => {
                    if (object.values[0].cell === "B2") {
                        t.is(object.values[0].value, "1、hello world服务");
                    }
                    if (object.values[0].cell === "C4") {
                        t.is(object.values[0].value, "返回“Hello ”+参数");
                    }
                },
                { readonly: true }
            );

            //writeJson('./src/20-parser/test-case/b01p-fix-node-type.js.btf', root);
        },
    };

    await parser(rsReader.result, opts);
});

test("parser: b02p-fix-node-data.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/b02p-fix-node-data.js.xlsx" });

    let opts = {
        "b02p-fix-node-data.js": async (root, context) => {
            await root.walk(
                Types.SheetSection,
                (node, object) => {
                    if (object.cell === "B2") {
                        t.is(object.value, "hello world服务");
                    }
                    if (object.cell === "C4") {
                        t.is(object.value, "返回:\t“Hello ” + 参数");
                    }
                },
                { readonly: true }
            );

            //writeJson('./src/20-parser/test-case/b02p-fix-node-data.js.btf', root);
        },
    };

    await parser(rsReader.result, opts);
});

test("parser: c01p-match-section-by-all-patterns.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/c01p-match-section-by-all-patterns.js.xlsx" });

    let opts = {
        "c01p-match-section-by-all-patterns.js": async (root, context) => {
            await root.walk(
                Types.SheetSection,
                (node, object) => {
                    if (object.value === "hello world服务") {
                        t.is(object.matchs[0].type, Types.Note);
                    } else {
                        // t.is(object.matchs.length >= 2, true);
                    }
                },
                { readonly: true }
            );

            writeJson("./src/20-parser/test-case/c01p-match-section-by-all-patterns.js.btf", root);
        },
    };

    await parser(rsReader.result, opts);
});

test("parser: e01p-create-node-by-match-result.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/e01p-create-node-by-match-result.js.xlsx" });

    let opts = {
        "e01p-create-node-by-match-result.js": async (root, context) => {
            await root.walk(
                Types.Return,
                (node, object) => {
                    t.is(object.cell, "C4");
                },
                { readonly: true }
            );

            writeJson("./src/20-parser/test-case/e01p-create-node-by-match-result.js.btf", root);
        },
    };

    await parser(rsReader.result, opts);

    t.is(1, 1);
});

test("parser: f01p-fix-method-by-note.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/f01p-fix-method-by-note.js.xlsx" });

    let opts = {
        "f01p-fix-method-by-note.js": async (root, context) => {
            await root.walk(
                Types.Method,
                (node, object) => {
                    t.is(1, 1);
                },
                { readonly: true }
            );

            writeJson("./src/20-parser/test-case/f01p-fix-method-by-note.js.btf", root);
        },
    };

    await parser(rsReader.result, opts);
});

test("parser: f02p-fix-method-parameter.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/f02p-fix-method-parameter.js.xlsx" });

    let opts = {
        "f02p-fix-method-parameter.js": async (root, context) => {
            await root.walk(
                Types.Method,
                (node, object) => {
                    t.is(!!object.parameters, true);
                },
                { readonly: true }
            );

            writeJson("./src/20-parser/test-case/f02p-fix-method-parameter.js.btf", root);
        },
    };

    await parser(rsReader.result, opts);
});

test("parser: f03p-fix-method-parameter-type.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/f03p-fix-method-parameter-type.js.xlsx" });

    let opts = {
        "f03p-fix-method-parameter-type.js": async (root, context) => {
            await root.walk(
                Types.Method,
                (node, object) => {
                    t.is(!!object.parameters, true);
                },
                { readonly: true }
            );

            writeJson("./src/20-parser/test-case/f03p-fix-method-parameter-type.js.btf", root);
        },
    };

    await parser(rsReader.result, opts);
});
