bus.on('解析器插件', function(){
    
    const patterns = require('./patterns');

    // 每个章节，用全部预设句型进行匹配
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.SheetSection, (node, object) => {
            object.matchs = matchAllPatterns(object.value);
        }, {readonly: true});

    });

    // 逐个句型进行匹配
    function matchAllPatterns(value){

        let ary = [];
        for (let i=0,pattern,rs,ctx; pattern=patterns[i++]; ) {
            ctx = {};
            rs = matchTextPattern(value, pattern, ctx);                 // 单个句型匹配
            if (rs) {
                rs.ok = !ctx.unMatch;
                ary.push(rs);
            }
        }

        if (ary.length) {
            bus.at('筛选匹配结果', ary);
            ary.forEach(m => delete m.ok);
            return ary;
        }else{
            return [{type: Types.UnMatch, value}];                  // 无匹配
        }
    }

    // 单个句型匹配
    function matchTextPattern(value, pattern, ctx){

        value = value.trim();
        let match = value.match(pattern.regexp);                        // 匹配句型
        if (!match) return null;                                        // 零匹配

        let rs;
        if (match.length === 1) {
            rs = {type: pattern.type, value};                           // 匹配
        }else if (match.length === 2) {
            if (pattern.leaf) {
                rs = {type: pattern.type, value: match[1]};             // 匹配
            }else{
                let matchs = subMatchAllPatterns(match[1], ctx);        // 继续子匹配
                rs = {type: pattern.type, matchs}; 
            }
        }else{
            let matchs = [];
            for (let j=1, ary; j<match.length; j++) {
                ary = subMatchAllPatterns(match[j], ctx);               // 匹配
                if (ary.length === 1) {
                    matchs.push( ary[0] );                              // 匹配到一个
                }else{
                    matchs.push( ary );                                 // 匹配到多个，数组，待处理
                }
            }
            rs = {type: pattern.type, matchs}; 
        }
        return rs;                                                      // 匹配结果对象
    }

    // 逐个句型进行子匹配
    function subMatchAllPatterns(value, ctx){

        let ary = [];
        for (let i=0,pattern,rs; pattern=patterns[i++]; ) {
            rs = matchTextPattern(value, pattern, ctx);                 // 单个句型匹配
            if (rs) {
                rs.ok = !ctx.unMatch;
                ary.push(rs);
            }
        }

        if (ary.length) {
            bus.at('筛选匹配结果', ary);
            ary.forEach(m => delete m.ok);
            return ary;
        }else{
            ctx.unMatch = true;                                         // 有未匹配项
            return [{type: Types.UnMatch, value}];                  // 无匹配
        }
    }


}());

