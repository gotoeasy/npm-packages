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
        return postobject.plugin("b01p-fix-node-type.js", async function (root) {
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
        return postobject.plugin("b02p-fix-node-data.js", async function (root) {
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
        const match = require("./match");

        // 全部章节逐个按预设句型进行匹配
        return postobject.plugin("c01p-match-section-by-all-patterns.js", async function (root) {
            await root.walk(
                Types.SheetSection,
                (node, object) => {
                    object.matchs = match(object.value, node, object);
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- c90m-filter-match-results ------- */
// 匹配结果在数组中，直接筛选修改数组
bus.on(
    "筛选匹配结果sss",
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
            let oMatch = null;
            for (let i = 0, match; (match = matchs[i++]); ) {
                if (match.type === Types.Return) {
                    oMatch = match;
                    break;
                }
            }
            if (oMatch) {
                matchs.length = 0;
                matchs.push(oMatch);
                return; // 仅剩一项，不必再选了
            }

            // ----------------------------------------------
            // 过滤：If句型优先
            // ----------------------------------------------
            oMatch = null;
            for (let i = 0, match; (match = matchs[i++]); ) {
                if (match.type === Types.If) {
                    oMatch = match;
                    break;
                }
            }
            if (oMatch) {
                matchs.length = 0;
                matchs.push(oMatch);
                return; // 仅剩一项，不必再选了
            }
        }
    })()
);

/* ------- d01p-create-node-by-match-result ------- */
bus.on(
    "解析器插件",
    (function () {
        // 根据匹配结果，整理成相应节点
        return postobject.plugin("d01p-create-node-by-match-result.js", async function (root) {
            await root.walk(Types.SheetSection, (node, object) => {
                let fnAddChild = (parent, obj) => {
                    let oChild = this.createNode(obj);
                    parent.addChild(oChild);

                    obj.matchs && obj.matchs.forEach((m) => fnAddChild(oChild, m));
                    delete oChild.object.matchs;
                };

                let ndMatchs = this.createNode({ type: Types.MatchSections }); // 存放所有匹配结果
                delete ndMatchs.object.type;
                node.addChild(ndMatchs);

                object.matchs.forEach((mc) => {
                    let ndMatch = this.createNode({ type: Types.MatchSection }); // 存放单个匹配结果
                    delete ndMatch.object.type;
                    ndMatchs.addChild(ndMatch);
                    fnAddChild(ndMatch, mc);
                });
                delete object.matchs;
            });
        });
    })()
);

/* ------- d02p-filter-match-results ------- */
bus.on(
    "解析器插件",
    (function () {
        // 筛选保留精确匹配节点(没有精确匹配节点则不处理)
        return postobject.plugin("d02p-filter-match-results.js", async function (root) {
            await root.walk(Types.MatchSections, (node) => {
                node.nodes.forEach((ndMatchSec) => {
                    let nd = ndMatchSec.nodes[0];
                    if (nd.type === Types.UnMatch) return;

                    // 特定类型节点下，含指定类型子节点时，属无效匹配，删除掉
                    if (
                        nd.type === Types.Add ||
                        nd.type === Types.Subtract ||
                        nd.type === Types.Multiply ||
                        nd.type === Types.Divide ||
                        nd.type === Types.GreaterEqualsThan ||
                        nd.type === Types.LessEqualsThan ||
                        nd.type === Types.NotEquals ||
                        nd.type === Types.Equals ||
                        nd.type === Types.GreaterThan ||
                        nd.type === Types.LessThan
                    ) {
                        if (nd.findChild(Types.If) || nd.findChild(Types.Return)) {
                            node.removeChild(ndMatchSec);
                        }
                    }
                });
            });
        });
    })()
);

/* ------- e01p-fix-method-by-note ------- */
bus.on(
    "解析器插件",
    (function () {
        // 顶级方法节点
        return postobject.plugin("e01p-fix-method-by-note.js", async function (root) {
            await root.walk(Types.Note, (node) => {
                if (node.findParent(Types.SheetSection).parent.parent.type === Types.Excel) {
                    node.type = Types.MethodNote;
                    node.findParent(Types.SheetSection).object.type = Types.Method;
                }
            });
        });
    })()
);

/* ------- e02p-fix-method-parameter ------- */
bus.on(
    "解析器插件",
    (function () {
        // 单个参数，反推初始化方法参数
        return postobject.plugin("e02p-fix-method-parameter.js", async function (root) {
            await root.walk(
                Types.Parameter,
                (node, object) => {
                    object.name = object.value; // 参数名称
                    object.value = "arg"; // 参数变量名

                    let ndMethod = node.findParent((nd, obj) => obj.type === Types.Method);
                    let parameters = (ndMethod.object.parameters = ndMethod.object.parameters || []);
                    if (!parameters.length) {
                        let type = null; // 参数类型未知
                        let name = object.name; // 参数名称
                        let value = object.value; // 参数变量名
                        parameters.push({ type, name, value });
                    }
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- e03p-fix-method-parameter-type ------- */
bus.on(
    "解析器插件",
    (function () {
        // 单个参数，反推初始化方法参数
        return postobject.plugin("e03p-fix-method-parameter-type.js", async function (root) {
            // -------------------------------------
            // 【方法】已有参数类型定义时直接使用
            // -------------------------------------
            await root.walk(
                Types.Parameter,
                (node, object) => {
                    let ndMethod = node.findParent((nd, obj) => obj.type === Types.Method);
                    let oParam = ndMethod.object.parameters[0];

                    if (oParam.type) {
                        node.type = Types.Var; // 设定节点类型为Var
                        object.type = oParam.type; // 设定参数类型
                    }
                },
                { readonly: true }
            );

            // -------------------------------------
            // 【方法】没有参数类型定义时，尝试推测
            // -------------------------------------
            await root.walk(
                Types.Parameter,
                (node, object) => {
                    let ndMethod = node.findParent((nd, obj) => obj.type === Types.Method);
                    let oParam = ndMethod.object.parameters[0];

                    if (oParam.type) return;

                    if (node.parent.type === Types.Add) {
                        let ndBrother = node.findBrother((nd) => nd !== this);
                        if (ndBrother && ndBrother.type) {
                            oParam.type = ndBrother.type; // 设定方法的参数类型
                            object.type = oParam.type; // 设定参数类型
                            node.type = Types.Var; // 设定节点类型为Var
                            return;
                        }
                    }
                },
                { readonly: true }
            );

            // -------------------------------------
            // 使用【方法】中推测的参数类型
            // -------------------------------------
            await root.walk(
                Types.Parameter,
                (node, object) => {
                    let ndMethod = node.findParent((nd, obj) => obj.type === Types.Method);
                    let oParam = ndMethod.object.parameters[0];

                    if (oParam.type) {
                        node.type = Types.Var; // 设定节点类型为Var
                        object.type = oParam.type; // 设定参数类型
                        object.name = oParam.name; // 设定参数类型
                        object.value = oParam.value; // 设定参数类型
                    }
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- e04p-fix-method-return-type ------- */
bus.on(
    "解析器插件",
    (function () {
        // 单个参数，反推初始化方法参数
        return postobject.plugin("e04p-fix-method-return-type.js", async function (root) {
            await root.walk(
                Types.SheetSection,
                async (node, object) => {
                    if (object.type !== Types.Method || object.returnType) return; // 非方法或已有返回类型

                    let ndReturn = node.findChild(Types.Return);
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

/* ------- f01p-check-unmatch ------- */
bus.on(
    "解析器插件",
    (function () {
        // TODO 检查匹配结果
        return postobject.plugin("f01p-check-unmatch.js", async function (root) {
            require("@gotoeasy/file").write("e:/1/generator-unmmmm.json", JSON.stringify(root, null, 2));

            await root.walk(
                Types.UnMatch,
                (node) => {
                    let ndExcel = node.findParent(Types.Excel);
                    let ndSection = node.findParent(Types.SheetSection);
                    ndSection.object.unmatch = true;

                    let type = "不知所云";
                    let file = ndExcel.object.file;
                    let cell = ndSection.object.cell;
                    let value = ndSection.object.value;
                    bus.at("QA", { type, file, cell, value });
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- f02p-check-mutil-match ------- */
bus.on(
    "解析器插件",
    (function () {
        // TODO 检查匹配结果
        return postobject.plugin("f02p-check-mutil-match.js", async function (root) {
            await root.walk(
                Types.MatchSections,
                (node) => {
                    if (node.nodes.length < 2) return;

                    let ndExcel = node.findParent(Types.Excel);
                    let ndSection = node.findParent(Types.SheetSection);
                    ndSection.object.unmatch = true;

                    let type = "难以抉择";
                    let file = ndExcel.object.file;
                    let cell = ndSection.object.cell;
                    let value = ndSection.object.value;
                    bus.at("QA", { type, file, cell, value });
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- g01p-fix-method-name ------- */
bus.on(
    "解析器插件",
    (function () {
        // 单个参数，反推初始化方法参数
        return postobject.plugin("g01p-fix-method-name.js", async function (root) {
            await root.walk(
                Types.SheetSection,
                (node, object) => {
                    if (object.type !== Types.Method || object.methodName) return; // 非方法或已有方法名都略过

                    if (/hello/i.test(object.value)) {
                        object.methodName = "hello";
                    } else {
                        object.methodName = "todo"; // TODO
                    }
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- g02p-fix-class-name ------- */
bus.on(
    "解析器插件",
    (function () {
        // 单个参数，反推初始化方法参数
        return postobject.plugin("g02p-fix-class-name.js", async function (root) {
            await root.walk(
                Types.SheetSection,
                (node, object) => {
                    // TODO

                    if (/hello/i.test(object.value)) {
                        node.findParent(Types.Excel).object.className = "HelloWorld";
                    }
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
            console.info(`【QA】${++cnt}`, JSON.stringify(obj, null, 2));
        };
    })()
);

/* ------- z90m-guess-method-name ------- */
bus.on("方法名", function (txt, opts) {
    console.info(txt, opts);
    return "todo";
});
