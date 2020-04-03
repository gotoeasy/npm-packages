bus.on('解析器插件', function(){
    
    const patterns = require('./patterns');

    // 每个章节，用全部预设句型进行匹配
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( NodeTypes.SheetSection, (node, object) => {
          //  let ary = matchAllPatterns(object.value);
            
            object.matchs = [...matchAllPatterns(object.value)];
        }, {readonly: true});

    });

    function matchAllPatterns(value){

        let ary = [];
        for (let i=0,pattern,rs; pattern=patterns[i++]; ) {
            rs = matchTextPattern(value, pattern);
            rs && ary.push(rs);
        }

        if (ary.length) {
            return ary;
        }else{
            return [{type: NodeTypes.UnMatch, value}];
        }
    }

    function matchTextPattern(value, pattern){

        value = value.trim();
        let match = value.match(pattern.regexp);                        // 匹配句型
        if (!match) return null;

        let rs;
        if (match.length === 1) {
            rs = {type: pattern.type, value};
        }else if (match.length === 2) {
            if (pattern.leaf) {
                rs = {type: pattern.type, value: match[1]};
            }else{
                let matchs = matchAllPatterns(match[1]);
                rs = {type: pattern.type, matchs};
            }
        }else{
            let matchs = [];
            for (let j=1, ary; j<match.length; j++) {
                matchs.push( matchAllPatterns(match[j]) );
            }
            rs = {type: pattern.type, matchs};
        }
        return rs;
    }


}());

