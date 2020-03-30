bus.on('解析器插件', function(){
    
    // 过滤句型匹配结果，处理独占性匹配
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( NodeTypes.SheetSection, (node, object) => {
            if (object.matchs.length < 2) return;

            let ary = null;
            for (let i=0,match; match=object.matchs[i++]; ) {
                if (match.type === NodeTypes.Return) {
                    ary = [match];
                    break;                                              // Return句型有独占性，其他即使匹配也忽略掉
                }
            }
            if (ary) {
                object.matchs = ary;
            }

        }, {readonly: true});

    });

}());

