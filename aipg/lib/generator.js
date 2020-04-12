const Types = require("./types");
const gen = require("@gotoeasy/bus").newInstance();

gen.on("代码生成", function (node) {
    if (!node || !node.type) {
        return "";
    }
    let rs = gen.at(node.type, node);
    if (!rs && !gen.on(node.type).length) {
        console.info("找不到生成器：", node.type);
        //throw new Error("generator not found  ..........  " + node.type);
    }
    return rs;
});

gen.on("查找子节点", function (node, type) {
    let nodes = node.nodes || [];
    for (let i = 0, nd; (nd = nodes[i++]); ) {
        if (nd.type === type) {
            return nd;
        }
    }
    return null;
});

gen.on(Types.Add, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => ary.push(gen.at("代码生成", nd)));
    return ary.join(" + ");
});

gen.on(Types.And, function (node) {
    let ary = [];
    for (let i = 0, nd, rs; (nd = node.nodes[i++]); ) {
        rs = gen.at("代码生成", nd);
        if (nd.type === Types.Or) {
            rs = `(${rs})`;
        }
        ary.push(rs);
    }
    return ary.join(" && ");
});

gen.on(Types.Blank, function () {
    return '""';
});

gen.on(Types.Break, function () {
    return "break;";
});

gen.on(Types.Call, function (node) {
    if (!node.nodes || !node.nodes.length) {
        return `${node.object.value}()`;
    }

    let ary = [];
    node.nodes.forEach((nd) => {
        ary.push(gen.at("代码生成", nd));
    });

    // TODO 参数
    return `${node.object.value}(${ary.join(", ")})`;
});

gen.on(Types.Continue, function () {
    return "continue;";
});

gen.on(Types.Digit, function (node) {
    return node.object.value;
});

gen.on(Types.Divide, function (node) {
    let ary = [];
    for (let i = 0, nd, rs; (nd = node.nodes[i++]); ) {
        rs = gen.at("代码生成", nd);
        if (nd.type === Types.Add || nd.type === Types.Subtract) {
            rs = `(${rs})`;
        }
        ary.push(rs);
    }
    return ary.join(" / ");
});

gen.on(Types.Else, function (node) {
    let ndSheetSection = node.findParent(Types.SheetSection);
    let body = [];
    ndSheetSection.nodes.forEach((nd) => {
        if (nd.type === Types.SheetSection) {
            body.push(gen.at("代码生成", nd));
        }
    });
    return `else {\r\n    ${body.join("\r\n")}\r\n}`;
});

gen.on(Types.ElseIf, function (node) {
    let condition = [];
    node.nodes.forEach((nd) => {
        condition.push(gen.at("代码生成", nd));
    });

    let ndSheetSection = node.findParent(Types.SheetSection);
    let body = [];
    ndSheetSection.nodes.forEach((nd) => {
        if (nd.type === Types.SheetSection) {
            body.push(gen.at("代码生成", nd));
        }
    });
    return `else if ( ${condition.join(" ")} ){\r\n    ${body.join("\r\n")}\r\n}`;
});

gen.on(Types.Empty, function () {
    return `""`;
});

gen.on(Types.Equal, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} = ${right};`;
});

gen.on(Types.Equals, function (node) {
    if (node.object.common) {
        let srcVar = node.nodes[0].type === Types.Var ? gen.at("代码生成", node.nodes[0]) : gen.at("代码生成", node.nodes[1]);
        return `${node.object.common}(${srcVar})`;
    }

    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);

    if (node.nodes[0].type === Types.Var && node.nodes[1].type === Types.Empty) {
        return `${left} == null || "".equals(${left})`;
    } else if (node.nodes[1].type === Types.Var && node.nodes[0].type === Types.Empty) {
        return `${right} == null || "".equals(${right})`;
    } else {
        return `${left} == ${right}`;
    }
});

gen.on(Types.ExactEquals, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} === ${right}`;
});

gen.on(
    Types.Excel,
    (function () {
        return function (node) {
            if (!node.nodes || !node.nodes.length) {
                return "";
            }

            let ary = [];
            ary.push(`package ${node.object.package};`);
            ary.push("");
            ary.push(getImports(node.object));
            ary.push("");
            ary.push(getClassComment(node.object));
            ary.push(`public class ${node.object.className} {`);
            node.nodes.forEach((nd) => {
                ary.push(gen.at("代码生成", nd));
            });
            ary.push("}");
            return ary.join("\r\n");
        };

        function getImports(object) {
            let set = new Set(object.imports);
            let imports = [...set];
            imports.sort();

            let ary = [];
            for (let i = 0, imp; (imp = imports[i++]); ) {
                ary.push(`import ${imp};`);
            }
            return ary.join("\r\n");
        }

        function getClassComment(object) {
            let ary = [];
            ary.push(`/*`);
            ary.push(`* ${object.className}类`);
            ary.push(`*/`);
            return ary.join("\r\n");
        }
    })()
);

gen.on(Types.GreaterEqualsThan, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} >= ${right}`;
});

gen.on(Types.GreaterThan, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} > ${right}`;
});

gen.on(Types.If, function (node) {
    let condition = [];
    node.nodes.forEach((nd) => {
        condition.push(gen.at("代码生成", nd));
    });

    let ndSheetSection = node.findParent(Types.SheetSection);
    let body = [];
    ndSheetSection.nodes.forEach((nd) => {
        if (nd.type === Types.SheetSection) {
            body.push(gen.at("代码生成", nd));
        }
    });
    return `if ( ${condition.join(" ")} ){\r\n    ${body.join("\r\n")}\r\n}`;
});

gen.on(Types.ElseIf, function (node) {
    let condition = [];
    node.nodes.forEach((nd) => {
        condition.push(gen.at("代码生成", nd));
    });

    let ndSheetSection = node.findParent(Types.SheetSection);
    let body = [];
    ndSheetSection.nodes.forEach((nd) => {
        if (nd.type === Types.SheetSection) {
            body.push(gen.at("代码生成", nd));
        }
    });
    return `else if ( ${condition.join(" ")} ){\r\n    ${body.join("\r\n")}\r\n}`;
});

gen.on(Types.IfElseStatement, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => ary.push(gen.at("代码生成", nd)));
    return ary.join("\r\n");
});

gen.on(Types.Integer, function (node) {
    return `${node.object.value}`;
});

gen.on(Types.LeftAddAdd, function (node) {
    let rs = gen.at("代码生成", node.nodes[0]);
    return `++${rs}`;
});

gen.on(Types.LeftSubtractSubtract, function (node) {
    let rs = gen.at("代码生成", node.nodes[0]);
    return `--${rs}`;
});

gen.on(Types.LessEqualsThan, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} <= ${right}`;
});

gen.on(Types.LessThan, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} < ${right}`;
});

gen.on(Types.Literal, function (node) {
    return `${node.object.value}`;
});

gen.on(Types.MatchSection, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => {
        ary.push(gen.at("代码生成", nd));
    });

    return ary.join("\r\n");
});

gen.on(Types.MatchSections, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => {
        ary.push(gen.at("代码生成", nd));
    });
    return ary.join("\r\n");
});

gen.on(Types.MatchSection, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => {
        ary.push(gen.at("代码生成", nd));
    });

    return ary.join("\r\n");
});

gen.on(Types.Method, function (node) {
    let object = node.object;
    let prefix = "public";
    let returnType = object.returnType;
    let methodName = object.methodName;
    let params = [];
    object.parameters.forEach((p) => {
        params.push(p.type + " " + p.value);
    });
    let param = params.join(", ");

    let ary = [];
    node.nodes.forEach((nd) => {
        ary.push(gen.at("代码生成", nd));
    });
    let sub = ary.join("\r\n");

    // 方法
    return `${prefix} ${returnType} ${methodName}(${param}) {\r\n ${sub}\r\n}`;
});

gen.on(Types.MethodNote, function (node) {
    if (!node.nodes || !node.nodes.length) {
        return "";
    }

    let ary = [];
    node.nodes.forEach((nd) => {
        ary.push(gen.at("代码生成", nd));
    });
    return ary.join("\r\n");
});

gen.on(Types.Multiply, function (node) {
    let ary = [];
    for (let i = 0, nd, rs; (nd = node.nodes[i++]); ) {
        rs = gen.at("代码生成", nd);
        if (nd.type === Types.Add || nd.type === Types.Subtract) {
            rs = `(${rs})`;
        }
        ary.push(rs);
    }
    return ary.join(" * ");
});

gen.on(Types.NotEquals, function (node) {
    let left = gen.at("代码生成", node.nodes[0]);
    let right = gen.at("代码生成", node.nodes[1]);
    return `${left} != ${right}`;
});

gen.on(Types.Note, function (node) {
    if (!node.nodes || !node.nodes.length) {
        return "";
    }

    let ary = [];
    node.nodes.forEach((nd) => {
        ary.push(gen.at("代码生成", nd));
    });
    return ary.join("\r\n");
});

gen.on(Types.Null, function () {
    return "null";
});

gen.on(Types.Number, function (node) {
    return `${node.object.value}`;
});

gen.on(Types.Or, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => ary.push(gen.at("代码生成", nd)));
    return ary.join(" || ");
});

gen.on(Types.Parameters, function (node) {
    return `${node.object.value}`;
});

gen.on(Types.Return, function (node) {
    if (node.nodes && node.nodes.length) {
        let rs = gen.at("代码生成", node.nodes[0]);
        return `return ${rs};`;
    } else {
        if (!node.object) {
            return `return;`;
        }
        if (node.object.value == null) {
            return `return;`;
        }
        return `return ${node.object.value};`;
    }
});

gen.on(Types.RightAddAdd, function (node) {
    let rs = gen.at("代码生成", node.nodes[0]);
    return `${rs}++`;
});

gen.on(Types.RightSubtractSubtract, function (node) {
    let rs = gen.at("代码生成", node.nodes[0]);
    return `${rs}--`;
});

gen.on(Types.Root, function (node) {
    if (!node.nodes || !node.nodes.length) {
        return "";
    }

    let ary = [];
    node.nodes.forEach((nd) => {
        ary.push(gen.at("代码生成", nd));
    });
    return ary.join("\r\n");
});

gen.on(Types.SheetHead, function () {
    return "";
});

gen.on(Types.SheetOther, function (node) {
    if (!node.nodes || !node.nodes.length) {
        return "";
    }

    let ary = [];
    node.nodes.forEach((nd) => {
        ary.push(gen.at("代码生成", nd));
    });
    return ary.join("\r\n");
});

gen.on(Types.SheetSection, function (node) {
    let ary = [];
    if (node.object.type === Types.Method) {
        let comments = ["/*"];
        comments.push(`* ${node.object.value}`);
        comments.push("*");
        let params = [];
        let parameters = node.object.parameters;
        parameters.forEach((p) => {
            params.push(`${p.type} ${p.value}`);
            comments.push(`* @param ${p.value} ${p.type} ${p.name}`);
        });
        if (node.object.returnType) {
            comments.push(`* @return ${node.object.returnType}`);
        }
        comments.push("*/");

        ary.push(comments.join("\r\n"));
        ary.push(`public ${node.object.returnType} ${node.object.methodName}(${params.join(", ")}) {`);
        node.nodes.forEach((nd) => {
            if (nd.type === Types.SheetSection) {
                ary.push(gen.at("代码生成", nd));
            }
        });
        ary.push(`}`);
        return ary.join("\r\n");
    }

    let ndMatchSections = node.findChild(Types.MatchSections);
    return gen.at("代码生成", ndMatchSections);
});

gen.on(Types.String, function (node) {
    return `"${node.object.value}"`;
});

gen.on(Types.Subtract, function (node) {
    let ary = [];
    node.nodes.forEach((nd) => ary.push(gen.at("代码生成", nd)));
    return ary.join(" - ");
});

gen.on(Types.Var, function (node) {
    // TODO
    return `${node.object.value}`;
});

gen.on("格式化代码", function (src, opts = {}) {
    try {
        return require("@gotoeasy/csjs").formatJava(src, opts);
    } catch (e) {
        console.error("format java src failed", e);
        return src;
    }
});

function print(node) {
    let src = gen.at("代码生成", node);
    if (node && (node.type === Types.Root || node.type === Types.Excel || (node.parent && node.parent.type === Types.Excel))) {
        return gen.at("格式化代码", src);
    }
    return src;
}

module.exports = print;
