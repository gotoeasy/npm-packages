const test = require("ava");

// ----------------------------------------------
// parser测试
// ----------------------------------------------
const File = require("@gotoeasy/file");
const postobject = require("@gotoeasy/postobject");
const reader = require("../lib/reader");
const parser = require("../lib/parser");
function writeJson(btfFile, root) {
    let ary = File.read(btfFile).split("-------------------- JSON --------------------");
    ary[1] = JSON.stringify(root, null, 2);
    File.write(btfFile, ary.join("-------------------- JSON --------------------\n"));
}
const NodeTypes = {
    root: "root", // 根节点类型
    Unknown: "Unknown", // Unknown
    Excel: "Excel", // Excel
    Sheet: "Sheet", // Sheet
    SheetHead: "SheetHead", // 头部
    SheetSection: "SheetSection", // 章节

    Return: "Return", // Return
    Add: "Add", // +

    String: "String", // String
    Number: "Number", // Number
    Var: "Var", // Var

    Note: "Note", // 说明性文字
    MethodNote: "MethodNote", // 方法的说明

    UnMatch: "UnMatch", // UnMatch
};

test("parser: b01p-fix-node-type.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/b01p-fix-node-type.js.xlsx" });

    let opts = {
        "b01p-fix-node-type.js": async (root, context) => {
            await root.walk(
                NodeTypes.SheetSection,
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
                NodeTypes.SheetSection,
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

test("parser: c01p-match-sentence-by-patterns.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/c01p-match-sentence-by-patterns.js.xlsx" });

    let opts = {
        "c01p-match-sentence-by-patterns.js": async (root, context) => {
            await root.walk(
                NodeTypes.SheetSection,
                (node, object) => {
                    if (object.value === "hello world服务") {
                        t.is(object.matchs[0].type, NodeTypes.Note);
                    } else {
                        t.is(object.matchs.length >= 2, true);
                    }
                },
                { readonly: true }
            );

            //writeJson('./src/20-parser/test-case/c01p-match-sentence-by-patterns.js.btf', root);
        },
    };

    await parser(rsReader.result, opts);
});

test("parser: d01p-filter-match-result.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/d01p-filter-match-result.js.xlsx" });

    let opts = {
        "d01p-filter-match-result.js": async (root, context) => {
            await root.walk(
                NodeTypes.Excel,
                (node, object) => {
                    t.is(1, 1);
                },
                { readonly: true }
            );

            //writeJson('./src/20-parser/test-case/d01p-filter-match-result.js.btf', root);
        },
    };

    await parser(rsReader.result, opts);
});

test("parser: e01p-fix-node-type-if-match-only-one.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/e01p-fix-node-type-if-match-only-one.js.xlsx" });

    let opts = {
        "e01p-fix-node-type-if-match-only-one.js": async (root, context) => {
            await root.walk(
                NodeTypes.Return,
                (node, object) => {
                    t.is(object.cell, "C4");
                },
                { readonly: true }
            );

            //writeJson('./src/20-parser/test-case/e01p-fix-node-type-if-match-only-one.js.btf', root);
        },
    };

    await parser(rsReader.result, opts);
});

test("parser: f01p-fix-child-node-if-match-only-one.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/f01p-fix-child-node-if-match-only-one.js.xlsx" });

    let opts = {
        "f01p-fix-child-node-if-match-only-one.js": async (root, context) => {
            await root.walk(
                NodeTypes.Add,
                (node, object) => {
                    t.is(object.matchs.length, 2);
                },
                { readonly: true }
            );

            //writeJson('./src/20-parser/test-case/f01p-fix-child-node-if-match-only-one.js.btf', root);
        },
    };

    await parser(rsReader.result, opts);
});

test("parser: g01p-fix-node-type-method-note.js", async (t) => {
    let rsReader = await reader({ file: "./test/parser/g01p-fix-node-type-method-note.js.xlsx" });

    let opts = {
        "g01p-fix-node-type-method-note.js": async (root, context) => {
            await root.walk(
                NodeTypes.MethodNote,
                (node, object) => {
                    t.is(1, 1);
                },
                { readonly: true }
            );

            let generator = require("../lib/generator");
            let src = generator(root);
            console.info("------------------", src);
            t.is(!!src, true);

            //writeJson('./src/20-parser/test-case/g01p-fix-node-type-method-note.js.btf', root);
        },
    };

    await parser(rsReader.result, opts);
});
