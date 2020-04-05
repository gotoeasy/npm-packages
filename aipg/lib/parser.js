/* ------- 010-reuires-exports ------- */
const bus = require("@gotoeasy/bus").newInstance();
const postobject = require("@gotoeasy/postobject");
const Types = require("./types");

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
                    if (node.type === Types.Unknown) {
                        node.type = Types.SheetSection; // 仅章节没有类型
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
                Types.SheetSection,
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
                Types.SheetSection,
                (node, object) => {
                    object.matchs = matchAllPatterns(object.value);
                },
                { readonly: true }
            );
        });

        // 逐个句型进行匹配
        function matchAllPatterns(value) {
            let ary = [];
            for (let i = 0, pattern, rs, ctx; (pattern = patterns[i++]); ) {
                ctx = {};
                rs = matchTextPattern(value, pattern, ctx); // 单个句型匹配
                if (rs) {
                    rs.ok = !ctx.unMatch;
                    ary.push(rs);
                }
            }

            if (ary.length) {
                bus.at("筛选匹配结果", ary);
                ary.forEach((m) => delete m.ok);
                return ary;
            } else {
                return [{ type: Types.UnMatch, value }]; // 无匹配
            }
        }

        // 单个句型匹配
        function matchTextPattern(value, pattern, ctx) {
            value = value.trim();
            let match = value.match(pattern.regexp); // 匹配句型
            if (!match) return null; // 零匹配

            let rs;
            if (match.length === 1) {
                rs = { type: pattern.type, value }; // 匹配
            } else if (match.length === 2) {
                if (pattern.leaf) {
                    rs = { type: pattern.type, value: match[1] }; // 匹配
                } else {
                    let matchs = subMatchAllPatterns(match[1], ctx); // 继续子匹配
                    rs = { type: pattern.type, matchs };
                }
            } else {
                let matchs = [];
                for (let j = 1, ary; j < match.length; j++) {
                    ary = subMatchAllPatterns(match[j], ctx); // 匹配
                    if (ary.length === 1) {
                        matchs.push(ary[0]); // 匹配到一个
                    } else {
                        matchs.push(ary); // 匹配到多个，数组，待处理
                    }
                }
                rs = { type: pattern.type, matchs };
            }
            return rs; // 匹配结果对象
        }

        // 逐个句型进行子匹配
        function subMatchAllPatterns(value, ctx) {
            let ary = [];
            for (let i = 0, pattern, rs; (pattern = patterns[i++]); ) {
                rs = matchTextPattern(value, pattern, ctx); // 单个句型匹配
                if (rs) {
                    rs.ok = !ctx.unMatch;
                    ary.push(rs);
                }
            }

            if (ary.length) {
                bus.at("筛选匹配结果", ary);
                ary.forEach((m) => delete m.ok);
                return ary;
            } else {
                ctx.unMatch = true; // 有未匹配项
                return [{ type: Types.UnMatch, value }]; // 无匹配
            }
        }
    })()
);

/* ------- c90m-filter-match-results ------- */
// 匹配结果在数组中，直接筛选修改数组
bus.on(
    "筛选匹配结果",
    (function () {
        return function (matchs) {
            if (!matchs) return; // 叶节点

            filterMatchs(matchs); // 过滤数组
            matchs.forEach((m) => bus.at("筛选匹配结果", m.matchs)); // 子节点继续过滤
        };

        function filterMatchs(matchs) {
            // ----------------------------------------------
            // 过滤：只有一个匹配，不用选了
            // ----------------------------------------------
            if (matchs.length === 1) {
                return; // 仅一项，不必再选了
            }

            // ----------------------------------------------
            // 过滤：有完全匹配项时，仅保留完全匹配项
            // ----------------------------------------------
            let oks = [];
            matchs.forEach((m) => {
                m.ok && oks.push(m);
            });
            if (oks.length) {
                matchs.length = 0;
                matchs.push(...oks);
                if (matchs.length === 1) {
                    return; // 仅剩一项，不必再选了
                }
            }

            // ----------------------------------------------
            // 过滤：Return句型有独占性，其他即使匹配也忽略掉
            // ----------------------------------------------
            let oReturn = null;
            for (let i = 0, match; (match = matchs[i++]); ) {
                if (match.type === Types.Return) {
                    oReturn = match;
                    break;
                }
            }
            if (oReturn) {
                matchs.length = 0;
                matchs.push(oReturn);
                return; // 仅剩一项，不必再选了
            }
        }
    })()
);

/* ------- e01p-create-node-by-match-result ------- */
bus.on(
    "解析器插件",
    (function () {
        // 根据匹配结果，整理成相应节点
        return postobject.plugin("e01p-create-node-by-match-result.js", async function (root, context) {
            await root.walk(Types.SheetSection, (node, object) => {
                let fnAddChild = (parent, obj) => {
                    let oChild = this.createNode(obj);
                    parent.addChild(oChild);

                    obj.matchs && obj.matchs.forEach((m) => fnAddChild(oChild, m));
                    delete oChild.object.matchs;
                };

                if (object.matchs.length === 1) {
                    if (!object.matchs[0].matchs) {
                        node.type = object.matchs[0].type;
                        delete object.matchs;
                    } else {
                        let oClone = node.clone();
                        oClone.type = object.matchs[0].type;
                        node.replaceWith(oClone);

                        object.matchs[0].matchs.forEach((m) => {
                            fnAddChild(oClone, m);
                        });
                        delete oClone.object.matchs;
                    }
                } else {
                    // TODO 多匹配？
                }
            });
        });
    })()
);

/* ------- e10p-check-unmatch ------- */
bus.on(
    "解析器插件",
    (function () {
        // TODO 检查匹配结果
        return postobject.plugin("e10p-check-unmatch.js", async function (root, context) {
            require("@gotoeasy/file").write("e:/1/generator-unmmmm.json", JSON.stringify(root, null, 2));

            await root.walk(
                Types.UnMatch,
                (node, object) => {
                    let type = "不知所云";
                    let cell = object.cell;
                    let value = object.value;
                    if (cell) {
                        bus.at("QA", { type, cell, value });
                    } else {
                        let parentNode = node.parent;
                        while (true) {
                            if (parentNode.object.cell) {
                                cell = parentNode.object.cell;
                                break;
                            } else if (parentNode.type === Types.Excel) {
                                break; // 不应该完全找不到
                            }
                            parentNode = parentNode.parent;
                        }
                        bus.at("QA", { type, cell, value });
                    }
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- e20p-check-mutil-match ------- */
bus.on(
    "解析器插件",
    (function () {
        // TODO 检查匹配结果
        return postobject.plugin("e20p-check-mutil-match.js", async function (root, context) {
            /*
        await root.walk( Types.SheetSection, (node, object) => {
            let warn = [];
         //   checkMatchResults(object.matchs, warn);
            if (warn.length) {
                console.info('[TODO]');
                //console.info('[TODO]', JSON.stringify({object, warn}, null, 2));
            }
        }, {readonly: true});
*/
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

/* ------- f01p-fix-method-by-note ------- */
bus.on(
    "解析器插件",
    (function () {
        // 反推方法参数
        return postobject.plugin("f01p-fix-method-by-note.js", async function (root, context) {
            await root.walk(Types.Note, (node, object) => {
                if (object.seq.length === 2) {
                    node.type = Types.Method;
                }
            });
        });
    })()
);

/* ------- f02p-fix-method-parameter ------- */
bus.on(
    "解析器插件",
    (function () {
        // 单个参数，反推初始化方法参数
        return postobject.plugin("f02p-fix-method-parameter.js", async function (root, context) {
            await root.walk(
                Types.Parameter,
                (node, object) => {
                    let parentNode = node.parent;
                    while (true) {
                        if (parentNode.type === Types.Method) {
                            let parameters = (parentNode.object.parameters = parentNode.object.parameters || []);
                            if (!parameters.length) {
                                object.name = object.value;
                                let type = null; // 参数类型未知
                                let name = object.name; // 参数名称
                                let value = (object.value = "arg"); // 参数变量名
                                parameters.push({ type, name, value });
                                break;
                            }
                        } else if (parentNode.type === Types.Excel) {
                            break; // 不应该完全找不到
                        }
                        parentNode = parentNode.parent;
                    }
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- f03p-fix-method-parameter-type ------- */
bus.on(
    "解析器插件",
    (function () {
        // 单个参数，反推初始化方法参数
        return postobject.plugin("f03p-fix-method-parameter-type.js", async function (root, context) {
            await root.walk(
                Types.Parameter,
                (node, object) => {
                    let ndMethod = node.findParent(Types.Method);
                    let oParam = ndMethod.object.parameters[0];

                    // -------------------------------
                    // 方法已有参数类型定义时直接使用
                    // -------------------------------
                    if (oParam.type) {
                        node.type = Types.Var; // 设定节点类型为Var
                        object.type = oParam.type; // 设定参数类型
                        return;
                    }

                    // -------------------------------
                    // 尝试反推初始化方法参数
                    // -------------------------------
                    if (node.parent.type === Types.Add) {
                        // 【加法】时，参考兄弟节点推定类型
                        let ndBrother = node.findBrother((nd) => nd !== this);
                        if (ndBrother && ndBrother.type) {
                            oParam.type = ndBrother.type; // 设定方法的参数类型
                            node.type = Types.Var; // 设定节点类型为Var
                            object.type = oParam.type; // 设定参数类型
                            return;
                        }
                    }
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- f04p-fix-method-name ------- */
bus.on(
    "解析器插件",
    (function () {
        // 单个参数，反推初始化方法参数
        return postobject.plugin("f04p-fix-method-name.js", async function (root, context) {
            await root.walk(
                Types.Method,
                (node, object) => {
                    if (/hello/i.test(object.value)) {
                        object.methodNmae = "hello";
                    }
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- f05p-fix-method-return-type ------- */
bus.on(
    "解析器插件",
    (function () {
        // 单个参数，反推初始化方法参数
        return postobject.plugin("f05p-fix-method-return-type.js", async function (root, context) {
            await root.walk(
                Types.Method,
                async (node, object) => {
                    if (object.returnType) {
                        return; // 已经有返回类型了
                    }

                    let ndReturn;
                    await node.walk(
                        Types.Return,
                        (nd) => {
                            ndReturn = nd;
                            return false;
                        },
                        { readonly: true }
                    );

                    if (!ndReturn) {
                        object.returnType = "void";
                        return; // void
                    }

                    let returnType;
                    await ndReturn.walk(
                        (nd, obj) => {
                            if (obj.value !== undefined && obj.type) {
                                returnType = obj.type; // 使用某个变量的类型
                                return false;
                            }
                        },
                        { readonly: true }
                    );

                    object.returnType = returnType || "void";
                },
                { readonly: true }
            );
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

/* ------- z90m-000-qa ------- */
bus.on(
    "QA",
    (function (cnt = 0) {
        return function (obj) {
            console.info(`[QA] ${++cnt}`, JSON.stringify(obj, null, 2));
        };
    })()
);

/* ------- z90m-guess-method-name ------- */
bus.on("方法名", function (txt, opts) {
    return "todo";
});
