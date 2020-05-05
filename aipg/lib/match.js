const Types = require("./types");
const aryFns = [];

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

aryFns.push((str) => {
    let rs = str.match(/^(.+?)[,，、]?(?:并且|而且|且)[,，、]?(.+)$/);
    if (rs) {
        return {
            type: Types.And,
            matchs: [rs[1], rs[2]],
        };
    }
});

aryFns.push((str) => {
    let rs = str.match(/^(空白|Blank)$/i);
    if (rs) return { type: Types.Blank, value: rs[1], exact: true };
});

aryFns.push((str) => (/^(Break|跳出循环)$/i.test(str) ? { type: Types.Break, exact: true } : null));

aryFns.push((str) => {
    let rs = str.match(/^([0-9]+)$/i); // 999
    if (rs) return { type: Types.Digit, value: rs[1], exact: true };

    rs = str.match(/^(-[0-9]+)$/i); // -999
    if (rs) return { type: Types.Integer, value: rs[1], exact: true };

    rs = str.match(/^([-]?[0-9]+.[0-9]+)$/i); // -999.999
    if (rs) return { type: Types.Double, value: rs[1], exact: true };
});

// Else
aryFns.push((str) => {
    let rs = str.match(
        /^(否则|其他情况|其他情况时|其他情况下|其他情况的时候|其他情况的话|其他场合|其他场合时|其他场合下|其他场合的时候|其他场合的话)[,，]?(做以下处理|做下面处理|做以下的处理|做下面的处理)?[.。]?$/
    );
    if (rs) return { type: Types.Else };

    return null;
});

aryFns.push((str) => {
    let rs = str.match(/^(Empty|Nothing)$/i);
    if (rs) return { type: Types.Empty, value: rs[1], exact: true };
});

aryFns.push((str) => {
    let rs = str.match(/^(?:当|若|如果|假如|假设)?(.+?比.+?小|小时|小的时候|小的话|小的情况下)[,.。、:：]?(?:做以下处理|做下面处理)?[.。]?$/);
    if (rs && str !== rs[1]) return { type: Types.If, matchs: [rs[1]] };

    rs = str.match(
        /^(?:当|若|如果|假如|假设)?(.+?和.+?一样大时|一样大的时候|一样大小时|一样大小的时候|一样大小的话)[,.。、:：]?(?:做以下处理|做下面处理)?[.。]?$/
    );
    if (rs && str !== rs[1]) return { type: Types.If, matchs: [rs[1]] };

    rs = str.match(
        /^(?:如果|假如|假若|若|当)[是]?(.+?)(?:时|的话|的时候|的场合|的情况|的情况的话|的情况时候)?[，,.]?(?:做以下处理|做下面处理)?[.。]?$/
    );
    if (rs) return { type: Types.If, matchs: [rs[1]] };

    return null;
});

// NNNN服务
aryFns.push((str) => {
    let rs = str.match(/^(.*?)服务[.。．]?$/);
    if (rs) return { type: Types.Note, value: rs[1] };

    return null;
});

aryFns.push((str) => (/^(空|null)$/i.test(str) ? { type: Types.Null, exact: true } : null));

aryFns.push((str) => {
    let rs = str.match(/^([0-9]+[.]?[0-9]+\s*小时)$/i); // 99.99小时
    if (rs) return { type: Types.NumHour, value: rs[1], exact: true };
});

aryFns.push((str) => {
    let rs = str.match(/^(.+?)[,，、]?(?:或者|或是|或)[,，、]?(.+)$/);
    if (rs) {
        return {
            type: Types.Or,
            matchs: [rs[1], rs[2]],
        };
    }
});

aryFns.push((str) => {
    let rs = str.match(/^(参数|Parameter)$/i);
    if (rs) return { type: Types.Parameter, name: rs[1], value: rs[1], exact: true };
});

aryFns.push((str) => {
    let rs = str.match(/^参数[.．](\S+)$/i);
    if (rs) return { type: Types.Parameters, name: rs[1], value: rs[1] };
});

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
        str.match(/^\[(.*?)\](.*)$/) ||
        str.match(/^【(.*?)】(.*)$/);

    if (!rs || rs[2]) return null;

    return {
        type: Types.String,
        value: rs[1],
        exact: true,
    };
});

aryFns.push((str) => (/^(True|真)$/i.test(str) ? { type: Types.True, exact: true } : null));

aryFns.push((str) => (/^(0|０|Zero|〇|零)$/i.test(str) ? { type: Types.Zero, exact: true } : null));

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

    rs = str.match(/^(.+?)和(.+?)(?:一样大时|一样大的时候|一样大小时|一样大小|大小一样|一样大小的时候|一样大小的话|一样|同样|一模一样)$/);
    if (rs) return { type: Types.Equals, matchs: [rs[1], rs[2]] };

    rs = str.match(/^(.+?)(?:>|＞|大于)(.+)$/);
    if (rs) return { type: Types.GreaterThan, matchs: [rs[1], rs[2]] };

    rs = str.match(/^(.+?)比(.+?)(?:大|大时|大的时候|大的话|大的情况下)$/);
    if (rs) return { type: Types.GreaterThan, matchs: [rs[1], rs[2]] };

    rs = str.match(/^(.+?)(?:<|＜|小于)(.+)$/);
    if (rs) return { type: Types.LessThan, matchs: [rs[1], rs[2]] };

    rs = str.match(/^(.+?)比(.+?)(?:小|小时|小的时候|小的话|小的情况下)$/);
    if (rs) return { type: Types.LessThan, matchs: [rs[1], rs[2]] };
});

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
