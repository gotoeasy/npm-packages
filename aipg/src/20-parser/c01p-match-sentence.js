const patterns = [];
patterns.push({type: 'Return', regexp: /^(?:返回)\s*(?:[:：]+)(.+)(?:[．.。]?)$/});   // 返回:NNNNNNNNNN
patterns.push({type: 'Add', regexp: /^(.+)(?:[+＋]+)(.+)$/});   // NNN + NNN
patterns.push({type: 'String', regexp: /^(?:“)(.*)(?:”)$/});   // “NNNNNN”

bus.on('解析器插件', function(){
    
    // 句型匹配
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( NodeTypes.SheetSection, (node, object) => {

            for (let i=0,pattern,match; pattern=patterns[i++]; ) {
                object.matchs = matchText(object.value);
            }

        }, {readonly: true});

    });

    function matchText(value){
        value = value.trim();

        let rs = [];
        for (let i=0,pattern,match; pattern=patterns[i++]; ) {
            match = value.match(pattern.regexp);                    // 匹配句型
            if (!match) continue;

            if (pattern.type === NodeTypes.String || pattern.type === NodeTypes.Number || pattern.type === NodeTypes.Var) {
                rs.push({type: pattern.type, value: match[1]});
            }else{
                let ary = [];
                for (let j=1; j<match.length; j++) {
                    ary.push( ...matchText(match[j]) );                 // 匹配句型中的全部元素
                }
                rs.push({type: pattern.type, matchs: ary});
            }

        }

        if (!rs.length) {
            rs.push({type: NodeTypes.UnMatch, value});
        }
        return rs;
    }

}());

