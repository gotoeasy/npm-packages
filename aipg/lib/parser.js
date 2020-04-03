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

/* ------- c01p-match-section-by-all-patterns ------- */
bus.on(
    "解析器插件",
    (function () {
        const patterns = require("./patterns");

        // 每个章节，用全部预设句型进行匹配
        return postobject.plugin("c01p-match-section-by-all-patterns.js", async function (root, context) {
            await root.walk(
                NodeTypes.SheetSection,
                (node, object) => {
                    //  let ary = matchAllPatterns(object.value);

                    object.matchs = [...matchAllPatterns(object.value)];
                },
                { readonly: true }
            );
        });

        function matchAllPatterns(value) {
            let ary = [];
            for (let i = 0, pattern, rs; (pattern = patterns[i++]); ) {
                rs = matchTextPattern(value, pattern);
                rs && ary.push(rs);
            }

            if (ary.length) {
                return ary;
            } else {
                return [{ type: NodeTypes.UnMatch, value }];
            }
        }

        function matchTextPattern(value, pattern) {
            value = value.trim();
            let match = value.match(pattern.regexp); // 匹配句型
            if (!match) return null;

            let rs;
            if (match.length === 1) {
                rs = { type: pattern.type, value };
            } else if (match.length === 2) {
                if (pattern.leaf) {
                    rs = { type: pattern.type, value: match[1] };
                } else {
                    let matchs = matchAllPatterns(match[1]);
                    rs = { type: pattern.type, matchs };
                }
            } else {
                let matchs = [];
                for (let j = 1, ary; j < match.length; j++) {
                    matchs.push(matchAllPatterns(match[j]));
                }
                rs = { type: pattern.type, matchs };
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
                    filterMatchResults(object.matchs); // 过滤匹配结果
                },
                { readonly: true }
            );
        });

        function filterMatchResults(matchs) {
            if (!matchs) return; // 叶节点

            if (!(Array.isArray(matchs) || matchs instanceof Array)) {
                return filterMatchResults(matchs.matchs); // 非数组，子节点继续
            }

            matchs.length > 1 && filterMatchs(matchs); // 过滤

            matchs.forEach((ary) => filterMatchResults(ary)); // 子节点继续过滤
        }

        function filterMatchs(matchs) {
            // 过滤
            let oReturn = null;
            for (let i = 0, match; (match = matchs[i++]); ) {
                if (match.type === NodeTypes.Return) {
                    oReturn = match;
                    break; // Return句型有独占性，其他即使匹配也忽略掉
                }
            }
            if (oReturn) {
                matchs.length = 0;
                matchs.push([oReturn]);
            }
        }
    })()
);

/* ------- e01p-check-match-result ------- */
bus.on(
    "解析器插件",
    (function () {
        // 检查匹配结果
        return postobject.plugin("e01p-check-match-result.js", async function (root, context) {
            await root.walk(
                NodeTypes.SheetSection,
                (node, object) => {
                    let warn = [];
                    checkMatchResults(object.matchs, warn);
                    if (warn.length) {
                        console.info("[TODO]", JSON.stringify({ object, warn }, null, 2));
                    }
                },
                { readonly: true }
            );
        });

        function checkMatchResults(matchs, ary) {
            if (!matchs || !matchs.length) return;

            if (matchs.length > 1) {
                ary.push(matchs);
            }

            matchs.forEach((match) => checkMatchResults(match.matchs, ary));
        }
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

/* ------- z90m-guess-method-name ------- */
bus.on("方法名", function (txt, opts) {
    return "todo";
});
