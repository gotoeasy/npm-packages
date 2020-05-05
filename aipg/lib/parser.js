/* ------- 010-reuires-exports ------- */
const bus = require("@gotoeasy/bus").newInstance();
const postobject = require("@gotoeasy/postobject");
const Types = require("./types");

module.exports = async function (oSheet, opts) {
    let plugins = bus.on("解析器插件"); // 用bus.on而不是bus.at
    let context = await postobject(plugins).process(oSheet, opts);
    return context;
};

/* ------- b01p-fix-package ------- */
bus.on(
    "解析器插件",
    (function () {
        // 初始化包名
        return postobject.plugin("b01p-fix-package", async function (root) {
            await root.walk(
                Types.Excel,
                (node, object) => {
                    if (/hello/i.test(object.file)) {
                        object.package = "demo";
                    } else {
                        object.package = "todo";
                    }
                    return false;
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- b02p-init-imports ------- */
bus.on(
    "解析器插件",
    (function () {
        // 初始化包名
        return postobject.plugin("b02p-init-imports", async function (root) {
            await root.walk(
                Types.Excel,
                (node, object) => {
                    object.imports = [];
                    return false;
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- b03p-fix-class-name ------- */
bus.on(
    "解析器插件",
    (function () {
        return postobject.plugin("b03p-fix-class-name", async function (root) {
            await root.walk(
                Types.Excel,
                (node, object) => {
                    // TODO
                    object.className = bus.at("类命名", object.file);

                    return false;
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- b04p-fix-node-type ------- */
bus.on(
    "解析器插件",
    (function () {
        // 初始化节点的章节类型
        return postobject.plugin("b04p-fix-node-type", async function (root) {
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

/* ------- b05p-fix-node-data ------- */
bus.on(
    "解析器插件",
    (function () {
        // 整理章节内容
        return postobject.plugin("b05p-fix-node-data", async function (root) {
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
        return postobject.plugin("c01p-match-section-by-all-patterns", async function (root) {
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

/* ------- d01p-create-node-by-match-result ------- */
bus.on(
    "解析器插件",
    (function () {
        // 根据匹配结果，整理成相应节点
        return postobject.plugin("d01p-create-node-by-match-result", async function (root) {
            await root.walk(Types.SheetSection, (node, object) => {
                let fnAddChild = (parent, obj) => {
                    let oChild = this.createNode(obj);
                    parent.addChild(oChild);

                    obj.matchs &&
                        obj.matchs.forEach((matchOrAry) => {
                            if (matchOrAry.type) {
                                fnAddChild(oChild, matchOrAry); // 正常的单个匹配对象
                            } else {
                                let ndCld = this.createNode({ type: Types.MutilSubMatch });
                                oChild.addChild(ndCld); // 子项有多个匹配，用一个包装节点包一下

                                matchOrAry.forEach((mc) => fnAddChild(ndCld, mc)); // 子项的每个匹配都放包装节点下
                            }
                        });
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

/* ------- e01p-filter-0001-match-section-by-syntax ------- */
bus.on(
    "解析器插件",
    (function () {
        // 章节不能是加减乘除等特定节点
        return postobject.plugin("e01p-filter-0001-match-section-by-syntax", async function (root) {
            await root.walk(Types.MatchSection, (node) => {
                node.nodes.forEach((nd) => {
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
                        nd.type === Types.LessThan ||
                        nd.type === Types.Or ||
                        nd.type === Types.And
                    ) {
                        nd.remove();
                    }
                });

                !node.nodes && node.remove();
            });
        });
    })()
);

/* ------- e01p-filter-0002-mutil-sub-match-by-or-node-syntax ------- */
bus.on(
    "解析器插件",
    (function () {
        // 子项有多个匹配时先检查过滤
        return postobject.plugin("e01p-filter-0002-mutil-sub-match-by-or-node-syntax", async function (root) {
            await root.walk(Types.Or, (node) => {
                let ndLeft = node.nodes[0];
                let ndRight = node.nodes[1];

                if (
                    !(
                        ndLeft.type === Types.GreaterEqualsThan ||
                        ndLeft.type === Types.LessEqualsThan ||
                        ndLeft.type === Types.NotEquals ||
                        ndLeft.type === Types.Equals ||
                        ndLeft.type === Types.GreaterThan ||
                        ndLeft.type === Types.LessThan ||
                        ndLeft.type === Types.Or ||
                        ndLeft.type === Types.And ||
                        ndLeft.type === Types.MutilSubMatch
                    )
                ) {
                    node.remove();
                    return;
                }

                if (
                    !(
                        ndRight.type === Types.GreaterEqualsThan ||
                        ndRight.type === Types.LessEqualsThan ||
                        ndRight.type === Types.NotEquals ||
                        ndRight.type === Types.Equals ||
                        ndRight.type === Types.GreaterThan ||
                        ndRight.type === Types.LessThan ||
                        ndRight.type === Types.Or ||
                        ndRight.type === Types.And ||
                        ndRight.type === Types.MutilSubMatch
                    )
                ) {
                    node.remove();
                    return;
                }

                if (ndLeft.type === Types.MutilSubMatch) {
                    let dels = [];
                    ndLeft.nodes.forEach((nd) => {
                        if (
                            !(
                                nd.type === Types.GreaterEqualsThan ||
                                nd.type === Types.LessEqualsThan ||
                                nd.type === Types.NotEquals ||
                                nd.type === Types.Equals ||
                                nd.type === Types.GreaterThan ||
                                nd.type === Types.LessThan ||
                                nd.type === Types.Or ||
                                nd.type === Types.And
                            )
                        ) {
                            dels.push(nd);
                        }
                    });
                    dels.forEach((nd) => nd.remove());

                    if (!ndLeft.nodes) {
                        node.remove();
                        return;
                    }

                    ndLeft.nodes.length === 1 && ndLeft.replaceWith(ndLeft.nodes[0].clone()); // 仅剩唯一一个节点时，替换掉MutilSubMatch节点
                }

                if (ndRight.type === Types.MutilSubMatch) {
                    let dels = [];
                    ndRight.nodes.forEach((nd) => {
                        if (
                            !(
                                nd.type === Types.GreaterEqualsThan ||
                                nd.type === Types.LessEqualsThan ||
                                nd.type === Types.NotEquals ||
                                nd.type === Types.Equals ||
                                nd.type === Types.GreaterThan ||
                                nd.type === Types.LessThan ||
                                nd.type === Types.Or ||
                                nd.type === Types.And
                            )
                        ) {
                            dels.push(nd);
                        }
                    });
                    dels.forEach((nd) => nd.remove());

                    if (!ndRight.nodes) {
                        node.remove();
                        return;
                    }

                    ndRight.nodes.length === 1 && ndRight.replaceWith(ndRight.nodes[0].clone()); // 仅剩唯一一个节点时，替换掉MutilSubMatch节点
                }
            });
        });
    })()
);

/* ------- e01p-filter-0003-mutil-sub-match-by-and-node-syntax ------- */
bus.on(
    "解析器插件",
    (function () {
        // 子项有多个匹配时先检查过滤
        return postobject.plugin("e01p-filter-0003-mutil-sub-match-by-and-node-syntax", async function (root) {
            await root.walk(Types.And, (node) => {
                let ndLeft = node.nodes[0];
                let ndRight = node.nodes[1];

                if (
                    !(
                        ndLeft.type === Types.GreaterEqualsThan ||
                        ndLeft.type === Types.LessEqualsThan ||
                        ndLeft.type === Types.NotEquals ||
                        ndLeft.type === Types.Equals ||
                        ndLeft.type === Types.GreaterThan ||
                        ndLeft.type === Types.LessThan ||
                        ndLeft.type === Types.Or ||
                        ndLeft.type === Types.And ||
                        ndLeft.type === Types.MutilSubMatch
                    )
                ) {
                    node.remove();
                    return;
                }

                if (
                    !(
                        ndRight.type === Types.GreaterEqualsThan ||
                        ndRight.type === Types.LessEqualsThan ||
                        ndRight.type === Types.NotEquals ||
                        ndRight.type === Types.Equals ||
                        ndRight.type === Types.GreaterThan ||
                        ndRight.type === Types.LessThan ||
                        ndRight.type === Types.Or ||
                        ndRight.type === Types.And ||
                        ndRight.type === Types.MutilSubMatch
                    )
                ) {
                    node.remove();
                    return;
                }

                if (ndLeft.type === Types.MutilSubMatch) {
                    let dels = [];
                    ndLeft.nodes.forEach((nd) => {
                        if (
                            !(
                                nd.type === Types.GreaterEqualsThan ||
                                nd.type === Types.LessEqualsThan ||
                                nd.type === Types.NotEquals ||
                                nd.type === Types.Equals ||
                                nd.type === Types.GreaterThan ||
                                nd.type === Types.LessThan ||
                                nd.type === Types.Or ||
                                nd.type === Types.And
                            )
                        ) {
                            dels.push(nd);
                        }
                    });
                    dels.forEach((nd) => nd.remove());

                    if (!ndLeft.nodes) {
                        node.remove();
                        return;
                    }

                    ndLeft.nodes.length === 1 && ndLeft.replaceWith(ndLeft.nodes[0].clone()); // 仅剩唯一一个节点时，替换掉MutilSubMatch节点
                }

                if (ndRight.type === Types.MutilSubMatch) {
                    let dels = [];
                    ndRight.nodes.forEach((nd) => {
                        if (
                            !(
                                nd.type === Types.GreaterEqualsThan ||
                                nd.type === Types.LessEqualsThan ||
                                nd.type === Types.NotEquals ||
                                nd.type === Types.Equals ||
                                nd.type === Types.GreaterThan ||
                                nd.type === Types.LessThan ||
                                nd.type === Types.Or ||
                                nd.type === Types.And
                            )
                        ) {
                            dels.push(nd);
                        }
                    });
                    dels.forEach((nd) => nd.remove());

                    if (!ndRight.nodes) {
                        node.remove();
                        return;
                    }

                    ndRight.nodes.length === 1 && ndRight.replaceWith(ndRight.nodes[0].clone()); // 仅剩唯一一个节点时，替换掉MutilSubMatch节点
                }
            });
        });
    })()
);

/* ------- e01p-filter-0010-mutil-sub-match-node-by-syntax ------- */
bus.on(
    "解析器插件",
    (function () {
        // 子项有多个匹配时先检查过滤
        return postobject.plugin("e01p-filter-0010-mutil-sub-match-node-by-syntax", async function (root) {
            await root.walk(Types.MutilSubMatch, (node) => {
                node.nodes.forEach((nd) => {
                    // 两元操作，必须有两个子节点，否则就是错误匹配，立马过滤
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
                        nd.type === Types.LessThan ||
                        nd.type === Types.Or ||
                        nd.type === Types.And
                    ) {
                        if (!nd.nodes || nd.nodes.length !== 2) {
                            nd.remove();
                            return;
                        }
                    }

                    // If节点的话，子节点得有唯一一个条件节点
                    if (nd.type === Types.If) {
                        if (!nd.nodes || nd.nodes.length !== 1) {
                            nd.remove();
                            return;
                        }

                        let ndCondi = nd.nodes[0];
                        if (
                            ndCondi.type !== Types.GreaterEqualsThan ||
                            ndCondi.type === Types.LessEqualsThan ||
                            ndCondi.type === Types.NotEquals ||
                            ndCondi.type === Types.Equals ||
                            ndCondi.type === Types.GreaterThan ||
                            ndCondi.type === Types.LessThan
                        ) {
                            nd.remove();
                            return;
                        }
                    }
                });

                if (!node.nodes) {
                    node.type = Types.MutilSubMatchNg; // 无匹配时改掉类型方便后续操作
                }
            });
        });
    })()
);

/* ------- e01p-filter-0020-mutil-sub-match-by-ng-node-syntax ------- */
bus.on(
    "解析器插件",
    (function () {
        // 子项有多个匹配时先检查过滤
        return postobject.plugin("e01p-filter-0020-mutil-sub-match-by-ng-node-syntax", async function (root) {
            await root.walk((node) => {
                // 仅处理两元操作
                if (
                    !(
                        node.type === Types.Add ||
                        node.type === Types.Subtract ||
                        node.type === Types.Multiply ||
                        node.type === Types.Divide ||
                        node.type === Types.GreaterEqualsThan ||
                        node.type === Types.LessEqualsThan ||
                        node.type === Types.NotEquals ||
                        node.type === Types.Equals ||
                        node.type === Types.GreaterThan ||
                        node.type === Types.LessThan ||
                        node.type === Types.Or ||
                        node.type === Types.And
                    )
                ) {
                    return;
                }

                if (node.nodes[0].type === Types.MutilSubMatchNg || node.nodes[1].type === Types.MutilSubMatchNg) {
                    node.remove();
                }
            });
        });
    })()
);

/* ------- e01p-filter-0030-mutil-sub-match-node-by-if ------- */
bus.on(
    "解析器插件",
    (function () {
        // IF节点下有多个匹配时，尝试解决
        return postobject.plugin("e01p-filter-0030-mutil-sub-match-node-by-if", async function (root) {
            await root.walk(Types.If, (node) => {
                if (node.nodes[0].type !== Types.MutilSubMatch) return;

                let ndMutilSubMatch = node.nodes[0];
                let dels = [];
                ndMutilSubMatch.nodes.forEach((nd) => {
                    // IF条件下的节点，必须是指定类型
                    if (
                        nd.type !== Types.GreaterEqualsThan &&
                        nd.type !== Types.LessEqualsThan &&
                        nd.type !== Types.NotEquals &&
                        nd.type !== Types.Equals &&
                        nd.type !== Types.GreaterThan &&
                        nd.type !== Types.LessThan &&
                        nd.type !== Types.Or &&
                        nd.type !== Types.And
                    ) {
                        dels.push(nd);
                    }
                });

                dels.forEach((nd) => ndMutilSubMatch.nodes.splice(ndMutilSubMatch.nodes.indexOf(nd), 1)); // 不是指定类型的都删除掉
            });
        });
    })()
);

/* ------- e90p-filter-fix-mutil-sub-match-node ------- */
bus.on(
    "解析器插件",
    (function () {
        // IF节点下有多个匹配时，尝试解决
        return postobject.plugin("e90p-filter-fix-mutil-sub-match-node", async function (root) {
            await root.walk(Types.MutilSubMatch, (node) => {
                // 剩余单个条件节点时，整理下节点结构，如：If - MutilSubMatch - Equals 改成 If - Equals
                if (node.nodes.length === 1) {
                    node.replaceWith(node.nodes[0].clone());
                    return;
                }
            });
        });
    })()
);

/* ------- f31p-filter-section-match-node-by-syntax ------- */
bus.on(
    "解析器插件",
    (function () {
        // 按语法过滤无效匹配
        return postobject.plugin("f31p-filter-section-match-node-by-syntax", async function (root) {
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

/* ------- g90p-filter-section-match-node-by-mutilsubmatchng-type ------- */
bus.on(
    "解析器插件",
    (function () {
        // 按语法过滤无效的章节匹配
        return postobject.plugin("g90p-filter-section-match-node-by-mutilsubmatchng-type", async function (root) {
            await root.walk(Types.MatchSection, (node) => {
                node.findChild(Types.MutilSubMatchNg) && node.remove(); // 含MutilSubMatchNg子节点就删掉
            });
        });
    })()
);

/* ------- k91p-fix-add-section-unmatch-node ------- */
bus.on(
    "解析器插件",
    (function () {
        // 无匹配节点的章节，补上UnMatch节点
        return postobject.plugin("k91p-fix-add-section-unmatch-node", async function (root) {
            await root.walk(Types.MatchSections, (node) => {
                if (!node.nodes.length) {
                    let ndMatchSection = this.createNode({ type: Types.MatchSection }); // 没MatchSection时加一个
                    node.addChild(ndMatchSection);
                    ndMatchSection.addChild(this.createNode({ type: Types.UnMatch })); // MatchSection下挂个UnMatch
                }
            });
        });
    })()
);

/* ------- m10p-fix-method-by-note ------- */
bus.on(
    "解析器插件",
    (function () {
        // 顶级方法节点
        return postobject.plugin("m10p-fix-method-by-note", async function (root) {
            await root.walk(Types.Note, (node) => {
                if (node.findParent(Types.SheetSection).parent.parent.type === Types.Excel) {
                    node.type = Types.MethodNote;
                    node.findParent(Types.SheetSection).object.type = Types.Method;
                }
            });
        });
    })()
);

/* ------- m20p-fix-parameter-name-value ------- */
bus.on(
    "解析器插件",
    (function () {
        // 反推初始化方法参数
        return postobject.plugin("m20p-fix-parameter-name-value", async function (root) {
            // 参数.名称
            await root.walk(
                Types.Parameters,
                (node, object) => {
                    let ndMethod = node.findParent((nd, obj) => obj.type === Types.Method);
                    let parameters = (ndMethod.object.parameters = ndMethod.object.parameters || []);

                    for (let i = 0, param; (param = parameters[i++]); ) {
                        if (param.value && param.name === object.name) {
                            object.value = param.value;
                            return; // 已有相应参数时略过
                        }
                    }

                    let type = null; // 参数类型未知
                    let name = object.name; // 参数名称
                    let value = bus.at("变量命名", name); // 参数变量名
                    parameters.push({ type, name, value });

                    object.value = value; // 参数变量名
                },
                { readonly: true }
            );

            // 参数
            await root.walk(
                Types.Parameter,
                (node, object) => {
                    let ndMethod = node.findParent((nd, obj) => obj.type === Types.Method);
                    let parameters = (ndMethod.object.parameters = ndMethod.object.parameters || []);
                    if (!parameters.length) {
                        let type = null; // 参数类型未知
                        let name = object.name; // 参数名称
                        let value = bus.at("变量命名", object.name); // 参数变量名
                        parameters.push({ type, name, value });

                        object.value = value; // 参数变量名
                    } else {
                        object.name = parameters[0].name; // 参数名称
                        parameters[0].value && (object.value = parameters[0].value); // 参数变量名
                    }
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- m30p-fix-parameter-type ------- */
bus.on(
    "解析器插件",
    (function () {
        // 推测参数类型
        return postobject.plugin("m30p-fix-parameter-type", async function (root) {
            // -------------------------------------
            // 【方法】已有参数类型定义时直接使用
            // -------------------------------------
            await guessParameterType(root);

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

            await root.walk(
                Types.Parameters,
                (node, object) => {
                    let ndMethod = node.findParent((nd, obj) => obj.type === Types.Method);
                    let parameters = ndMethod.object.parameters;

                    parameters.forEach((oParam) => {
                        if (oParam.type || oParam.name !== object.name) return;

                        if (node.parent.type === Types.Add) {
                            let ndBrother = node.findBrother((nd) => nd !== this);
                            if (ndBrother && ndBrother.type) {
                                oParam.type = ndBrother.type; // 设定方法的参数类型
                                object.type = oParam.type; // 设定参数类型
                                node.type = Types.Var; // 设定节点类型为Var
                            }
                        }
                    });
                },
                { readonly: true }
            );

            // -------------------------------------
            // 再次：【方法】已有参数类型定义时直接使用
            // -------------------------------------
            await guessParameterType(root);
        });

        // 使用方法参数的类型
        async function guessParameterType(root) {
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

            await root.walk(
                Types.Parameters,
                (node, object) => {
                    let ndMethod = node.findParent((nd, obj) => obj.type === Types.Method);
                    let parameters = (ndMethod.object.parameters = ndMethod.object.parameters || []);

                    for (let i = 0, param; (param = parameters[i++]); ) {
                        if (param.type && param.name === object.name) {
                            node.type = Types.Var; // 设定节点类型为Var
                            object.type = param.type; // 设定参数类型
                            return; // 已有相应参数时略过
                        }
                    }
                },
                { readonly: true }
            );
        }
    })()
);

/* ------- m40p-fix-method-return-type ------- */
bus.on(
    "解析器插件",
    (function () {
        // 单个参数，反推初始化方法参数
        return postobject.plugin("m40p-fix-method-return-type", async function (root) {
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

/* ------- n01p-check-unmatch ------- */
bus.on(
    "解析器插件",
    (function () {
        // TODO 检查匹配结果
        return postobject.plugin("n01p-check-unmatch", async function (root) {
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

/* ------- n02p-check-mutil-match ------- */
bus.on(
    "解析器插件",
    (function () {
        // TODO 检查匹配结果
        return postobject.plugin("n02p-check-mutil-match", async function (root) {
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

/* ------- p01p-fix-method-name ------- */
bus.on(
    "解析器插件",
    (function () {
        return postobject.plugin("p01p-fix-method-name", async function (root) {
            await root.walk(
                Types.SheetSection,
                (node, object) => {
                    if (object.type !== Types.Method || object.methodName) return; // 非方法或已有方法名都略过

                    object.methodName = bus.at("方法命名", object.value);
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- p02p-fix-class-name ------- */
bus.on(
    "解析器插件",
    (function () {
        // 单个参数，反推初始化方法参数
        return postobject.plugin("p02p-fix-class-name", async function (root) {
            await root.walk(
                Types.SheetSection,
                (node, object) => {
                    // TODO

                    if (/hello/i.test(object.value)) {
                        node.findParent(Types.Excel).object.className = "HelloWorld";
                    }
                    return false;
                },
                { readonly: true }
            );
        });
    })()
);

/* ------- y01p-optimize-add-string ------- */
bus.on(
    "解析器插件",
    (function () {
        // 优化：俩字符串直接相加，合并为一个节点
        return postobject.plugin("y01p-optimize-add-string", async function (root) {
            await root.walk(Types.Add, (node) => {
                let ndLeft = node.nodes[0];
                let ndRight = node.nodes[1];
                if (ndLeft.type !== Types.String || ndRight.type !== Types.String) return;

                let ndString = this.createNode({ type: Types.String, value: ndLeft.object.value + ndRight.object.value });
                node.replaceWith(ndString);
            });
        });
    })()
);

/* ------- y01p-optimize-common ------- */
bus.on(
    "解析器插件",
    (function () {
        // 优化：俩字符串直接相加，合并为一个节点
        return postobject.plugin("y01p-optimize-common", async function (root) {
            await root.walk(Types.Equals, (node, object) => {
                let ndLeft = node.nodes[0];
                let ndRight = node.nodes[1];

                if (ndLeft.type === Types.Blank || ndRight.type === Types.Blank) {
                    object.common = "org.apache.commons.lang.StringUtils.isBlank";
                } else if (ndLeft.type === Types.Empty || ndRight.type === Types.Empty) {
                    object.common = "org.apache.commons.lang.StringUtils.isEmpty";
                }
            });

            await root.walk(Types.NotEquals, (node, object) => {
                let ndLeft = node.nodes[0];
                let ndRight = node.nodes[1];

                if (ndLeft.type === Types.Blank || ndRight.type === Types.Blank) {
                    object.common = "org.apache.commons.lang.StringUtils.isNotBlank";
                } else if (ndLeft.type === Types.Empty || ndRight.type === Types.Empty) {
                    object.common = "org.apache.commons.lang.StringUtils.isNotEmpty";
                }
            });
        });
    })()
);

/* ------- y90p-optimize-imports ------- */
bus.on(
    "解析器插件",
    (function () {
        // isBlank
        return postobject.plugin("y90p-optimize-imports", async function (root) {
            let imports = root.nodes[0].object.imports;
            let oImp = {};
            imports.forEach((imp) => {
                let cls = imp.substring(imp.lastIndexOf(".") + 1);
                oImp[cls] = imp;
            });

            await root.walk((node, object) => {
                if (!object.common) return;

                let ary = object.common.split(".");
                let method = ary.pop();
                let cls = ary.pop();
                ary.push(cls);
                let imp = ary.join(".");

                if (!oImp[cls] || oImp[cls] === imp) {
                    object.import = imp;
                    object.common = `${cls}.${method}`;
                    oImp[cls] = imp; // 导入没冲突就可以import
                }
            });

            let imps = [];
            for (let cls in oImp) {
                imps.push(oImp[cls]);
            }
            let oSet = new Set(imps);
            imports.length = 0;
            imports.push(...oSet);
            imports.sort();
        });
    })()
);

/* ------- z01p-export-root-to-result ------- */
bus.on(
    "解析器插件",
    (function () {
        // 解析结果添加接口方便查看节点
        return postobject.plugin("z01p-export-root-to-result", async function (root, context) {
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

/* ------- z90m-naming ------- */
const naming = require("./naming");

bus.on("类命名", function (str) {
    !str && bus.at("QA", "类命名找不着北");
    if (/hello/i.test(str)) {
        return "HelloWorld";
    }
    return naming.className(str);
});

bus.on("方法命名", function (str) {
    !str && bus.at("QA", "方法命名找不着北");
    return naming.methodName(str);
});

bus.on("变量命名", function (str) {
    !str && bus.at("QA", "变量命名找不着北");
    return naming.varName(str);
});
