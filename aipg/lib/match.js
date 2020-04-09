/* ------- 000-require ------- */
const Types = require("./types");
const aryFns = [];

/* ------- a01-single ------- */
aryFns.push((str) => (/^(空|null)$/i.test(str) ? { type: Types.Null } : null));
aryFns.push((str) => (/^(Break|跳出循环)$/i.test(str) ? { type: Types.Break } : null));
aryFns.push((str) => (/^(True|真)$/i.test(str) ? { type: Types.True } : null));
aryFns.push((str) => (/^(0|０|Zero|〇|零)$/i.test(str) ? { type: Types.Zero } : null));

aryFns.push((str) => {
    let rs = str.match(/^(参数|Parameter)$/i);
    if (rs) {
        return {
            type: Types.Parameter,
            value: rs[1],
        };
    }

    return null;
});

/* ------- a02-return ------- */
aryFns.push((str) => {
    let rs = str.match(/^返回(?:值|值为|值是)?\s*[:：](.+)[．.。]?$/);
    if (rs) {
        return {
            type: Types.Return,
            matchs: [rs[1]],
        };
    }

    return /^(返回|Return)$/i.test(str) ? { type: Types.Return } : null;
});

/* ------- a03-string ------- */
// 函数适用于有子项的匹配，或是较复杂的匹配逻辑，返回值需要指定类型，子项用items数组，值用value，exact表示完全独占匹配（TODO 考虑验证回调函数）
// 字符串
aryFns.push((str) => {
    let rs =
        str.match(/^"(.*?)"(.*)$/) ||
        str.match(/^'(.*?)'(.*)$/) ||
        str.match(/^“(.*?)”(.*)$/) ||
        str.match(/^「(.*?)」(.*)$/) ||
        str.match(/^『(.*?)』(.*)$/) ||
        str.match(/^［(.*?)］(.*)$/) ||
        str.match(/^\[(.*?)\](.*)$/);

    if (!rs || rs[2]) return null;

    return {
        type: Types.String,
        value: rs[1],
        exact: true,
    };
});

/* ------- a90-note ------- */
// NNNN服务
aryFns.push((str) => {
    let rs = str.match(/^(.*?)服务[.。．]?$/);
    if (rs) return { type: Types.Note, value: rs[1] };

    return null;
});

/* ------- b01-arithmetic  ------- */
aryFns.push((str) => {
    let rs = str.match(/^(.+?)(?:[×✖*]{1,1})(.+)$/);
    if (rs) {
        return {
            type: Types.Multiply, // 乘
            matchs: [rs[1], rs[2]], // [左，右]
        };
    }

    rs = str.match(/^(.+?)(?:[/／÷]{1,1})(.+)$/);
    if (rs) {
        return {
            type: Types.Divide, // 除
            matchs: [rs[1], rs[2]], // [左，右]
        };
    }

    rs = str.match(/^(.+?)(?:[＋✙✛+]{1,1})(.+)$/);
    if (rs) {
        return {
            type: Types.Add, // 加
            matchs: [rs[1], rs[2]], // [左，右]
        };
    }

    rs = str.match(/^(.+?)(?:[―‐-]{1,1})(.+)$/);
    if (rs) {
        return {
            type: Types.Subtract, // 减
            matchs: [rs[1], rs[2]], // [左，右]
        };
    }
});

/* ------- c01-1-if ------- */
aryFns.push((str) => {
    let rs = str.match(/^(?:如果|假如|假若|若|当)[是]?(.+?)(?:的话|的场合|的情况|的情况的话|的情况时候)?[，,.]?(?:做以下处理|做下面处理)?[.。]?$/);
    if (rs) return { type: Types.If, matchs: [rs[1]] };

    return null;
});

/* ------- c01-2-else ------- */
// Else
aryFns.push((str) => {
    let rs = str.match(
        /^(否则|其他情况|其他情况时|其他情况下|其他情况的时候|其他情况的话|其他场合|其他场合时|其他场合下|其他场合的时候|其他场合的话)[,，]?(做以下处理|做下面处理|做以下的处理|做下面的处理)?[.。]?$/
    );
    if (rs) return { type: Types.Else };

    return null;
});

/* ------- c02-condition ------- */
// 条件
aryFns.push((str) => {
    let rs = str.match(/^(.+?)(?:>=|>＝|＞=|＞＝|≧|大于等于)(.+)$/);
    if (rs) return { type: Types.GreaterEqualsThan, matchs: [rs[1], rs[2]] };

    rs = str.match(/^(.+?)(?:<=|＜=|＜＝|<＝|≦|小于等于)(.+)$/);
    if (rs) return { type: Types.LessEqualsThan, matchs: [rs[1], rs[2]] };

    rs = str.match(/^(.+?)(?:<>|<＞|＜>|＜＞|!=|!＝|！＝|！=|≠|不等于)(.+)$/);
    if (rs) return { type: Types.NotEquals, matchs: [rs[1], rs[2]] };

    rs = str.match(/^(.+?)(?:=|＝|等于|是|为)(.+)$/);
    if (rs) return { type: Types.Equals, matchs: [rs[1], rs[2]] };

    rs = str.match(/^(.+?)(?:>|＞|大于)(.+)$/);
    if (rs) return { type: Types.GreaterThan, matchs: [rs[1], rs[2]] };

    rs = str.match(/^(.+?)(?:<|＜|小于)(.+)$/);
    if (rs) return { type: Types.LessThan, matchs: [rs[1], rs[2]] };

    return null;
});

/* ------- z99-exports ------- */
function fnMatch(value) {
    let txt = value.trim(); // 去两边空白后再匹配
    let ary = [];
    for (let i = 0, fn, rs; (fn = aryFns[i++]); ) {
        rs = fn(txt);
        if (!rs) continue; // 不匹配就继续

        if (rs.matchs) {
            // 子项继续匹配
            for (let j = 0; j < rs.matchs.length; j++) {
                rs.matchs[j] = fnMatch(rs.matchs[j]);
                if (rs.matchs[j].length === 1) {
                    rs.matchs[j] = rs.matchs[j][0];
                }
            }
        }
        if (rs.exact) {
            ary = [rs]; // 完全独占性匹配
            delete rs.exact;
            break;
        }

        ary.push(rs); // 存起来
    }

    !ary.length && ary.push({ type: Types.UnMatch, value }); // 没有匹配时，固定放一个UnMatch
    return ary;
}

module.exports = fnMatch;
