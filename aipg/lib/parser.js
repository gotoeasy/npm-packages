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

    UnMatch: "UnMatch", // UnMatch
};

/* ------- 010-reuires-exports ------- */
const bus = require("@gotoeasy/bus").newInstance();
const postobject = require("@gotoeasy/postobject");

module.exports = async function (oSheet) {
    let plugins = bus.on("解析器插件"); // 用bus.on而不是bus.at
    let context = await postobject(plugins).process(oSheet);
    return context;
};

/* ------- b01p-fix-node-type ------- */
bus.on(
    "解析器插件",
    (function () {
        // 初始化节点的章节类型
        return postobject.plugin(/**/ __filename /**/, async function (root, context) {
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
        // 初始化节点的章节类型
        return postobject.plugin(/**/ __filename /**/, async function (root, context) {
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

/* ------- c01p-match-sentence ------- */
const patterns = [];
patterns.push({ type: "Return", regexp: /^(?:返回)\s*(?:[:：]+)(.+)(?:[．.。]?)$/ }); // 返回:NNNNNNNNNN
patterns.push({ type: "Add", regexp: /^(.+)(?:[+＋]+)(.+)$/ }); // NNN + NNN
patterns.push({ type: "String", regexp: /^(?:“)(.*)(?:”)$/ }); // “NNNNNN”

bus.on(
    "解析器插件",
    (function () {
        // 句型匹配
        return postobject.plugin(/**/ __filename /**/, async function (root, context) {
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

                if (pattern.type === NodeTypes.String || pattern.type === NodeTypes.Number || pattern.type === NodeTypes.Var) {
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
        // 初始化节点的章节类型
        return postobject.plugin(/**/ __filename /**/, async function (root, context) {
            await root.walk(
                NodeTypes.SheetSection,
                (node, object) => {
                    if (object.matchs.length < 2) return;

                    let ary = null;
                    for (let i = 0, match; (match = object.matchs[i++]); ) {
                        if (match.type === NodeTypes.Return) {
                            ary = [match];
                            break;
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

/* ------- e01p-fix-node-type-by-match-result ------- */
bus.on(
    "解析器插件",
    (function () {
        return postobject.plugin(/**/ __filename /**/, async function (root, context) {
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

/* ------- f01p-node-add-child-by-match-result ------- */
bus.on(
    "解析器插件",
    (function () {
        return postobject.plugin(/**/ __filename /**/, async function (root, context) {
            await root.walk((node, object) => {
                if (node.type === NodeTypes.UnMatch || !object.matchs || object.matchs.length !== 1) return;

                let matchs = object.matchs[0].matchs || [];
                for (let i = 0, oMatch; (oMatch = matchs[i++]); ) {
                    let oChild = this.createNode(oMatch);
                    node.addChild(oChild);
                }
                // TODO
                //delete object.matchs;
            });
        });
    })()
);

/* ------- z01p-export-root-to-result ------- */
bus.on(
    "解析器插件",
    (function () {
        // 解析结果添加接口方便查看节点
        return postobject.plugin(/**/ __filename /**/, async function (root, context) {
            context.root = () => root;
        });
    })()
);
