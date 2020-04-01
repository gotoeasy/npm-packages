/* ------- 000-consts-node-types ------- */
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

/* ------- 010-reuires-exports ------- */
const bus = require("@gotoeasy/bus").newInstance();
const postobject = require("@gotoeasy/postobject");

module.exports = async function (oSheet, opts) {
    let plugins = bus.on("解析器插件"); // 用bus.on而不是bus.at
    let context = await postobject(plugins).process(oSheet, opts);
    return context;
};

/* ------- b01p-fix-node-type ------- */
bus.on(
    "解析器插件",
    (function () {
        // 初始化节点的章节类型
        return postobject.plugin("b01p-fix-node-type.js", async function (root, context) {
            await root.walk(
                (node, object) => {
                    if (node.type === NodeTypes.Unknown) {
                        node.type = NodeTypes.SheetSection; // 仅章节没有类型
                    }
                    delete object.type; // 数据不存放type
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- b02p-fix-node-data ------- */
bus.on(
    "解析器插件",
    (function () {
        // 整理章节内容
        return postobject.plugin("b02p-fix-node-data.js", async function (root, context) {
            await root.walk(
                NodeTypes.SheetSection,
                (node, object) => {
                    // cell
                    object.cell = object.values[0].cell; // 起始单元格

                    // value
                    let ary = [];
                    object.values.forEach((oVal) => ary.push(oVal.value));
                    object.value = ary.join("\t"); // 拼接后的段句
                    if (object.Seq) {
                        object.value = object.value.substring(object.Seq.orig).trim(); // 去除章节号
                    }
                    object.value = object.value.replace(/^[,，、.．、，]*\s*/, ""); // 去除左边的标点符号空白

                    // seq
                    object.seq = object.Seq ? object.Seq.seq : null; // 段句的章节号

                    delete object.Seq;
                    delete object.values;
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- c01p-match-sentence-by-patterns ------- */
bus.on(
    "解析器插件",
    (function () {
        const patterns = require("./patterns");

        // 每个章节，用全部预设句型进行匹配
        return postobject.plugin("c01p-match-sentence-by-patterns.js", async function (root, context) {
            await root.walk(
                NodeTypes.SheetSection,
                (node, object) => {
                    for (let i = 0, pattern, match; (pattern = patterns[i++]); ) {
                        object.matchs = matchText(object.value);
                    }
                },
                { readonly: true }
            );
        });

        function matchText(value) {
            value = value.trim();

            let rs = [];
            for (let i = 0, pattern, match; (pattern = patterns[i++]); ) {
                match = value.match(pattern.regexp); // 匹配句型
                if (!match) continue;

                if (
                    pattern.type === NodeTypes.String || // 字符串肯定是叶节点了
                    pattern.type === NodeTypes.Number || // 数值肯定是叶节点了
                    pattern.type === NodeTypes.Var // 变量肯定是叶节点了
                ) {
                    rs.push({ type: pattern.type, value: match[1] });
                } else {
                    let ary = [];
                    for (let j = 1; j < match.length; j++) {
                        ary.push(...matchText(match[j])); // 匹配句型中的全部元素
                    }
                    rs.push({ type: pattern.type, matchs: ary });
                }
            }

            if (!rs.length) {
                rs.push({ type: NodeTypes.UnMatch, value });
            }
            return rs;
        }
    })()
);

/* ------- d01p-filter-match-result ------- */
bus.on(
    "解析器插件",
    (function () {
        // 过滤句型匹配结果，处理独占性匹配
        return postobject.plugin("d01p-filter-match-result.js", async function (root, context) {
            await root.walk(
                NodeTypes.SheetSection,
                (node, object) => {
                    if (object.matchs.length < 2) return;

                    let ary = null;
                    for (let i = 0, match; (match = object.matchs[i++]); ) {
                        if (match.type === NodeTypes.Return) {
                            ary = [match];
                            break; // Return句型有独占性，其他即使匹配也忽略掉
                        }
                    }
                    if (ary) {
                        object.matchs = ary;
                    }
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- e01p-fix-node-type-if-match-only-one ------- */
bus.on(
    "解析器插件",
    (function () {
        // 再次整理精确匹配的节点类型
        return postobject.plugin("e01p-fix-node-type-if-match-only-one.js", async function (root, context) {
            await root.walk(
                NodeTypes.SheetSection,
                (node, object) => {
                    if (object.matchs && object.matchs.length === 1) {
                        node.type = object.matchs[0].type; // 精确匹配到一个句型，节点类型直接替换
                    }
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- f01p-fix-child-node-if-match-only-one ------- */
bus.on(
    "解析器插件",
    (function () {
        // 根据匹配结果，整理成相应子节点
        return postobject.plugin("f01p-fix-child-node-if-match-only-one.js", async function (root, context) {
            await root.walk((node, object) => {
                if (node.type === NodeTypes.UnMatch || !object.matchs || object.matchs.length !== 1) return;

                let matchs = object.matchs[0].matchs || [];
                for (let i = 0, oMatch; (oMatch = matchs[i++]); ) {
                    let oChild = this.createNode(oMatch);
                    node.addChild(oChild);
                }

                delete object.matchs;
            });
        });
    })()
);

/* ------- z01p-export-root-to-result ------- */
bus.on(
    "解析器插件",
    (function () {
        // 解析结果添加接口方便查看节点
        return postobject.plugin("z01p-export-root-to-result.js", async function (root, context) {
            context.root = () => root;
        });
    })()
);
