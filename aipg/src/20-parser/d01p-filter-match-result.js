bus.on('解析器插件', function(){
    
    // 过滤句型匹配结果
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( NodeTypes.SheetSection, (node, object) => {
            filterMatchResults(object.matchs);                          // 过滤匹配结果
        }, {readonly: true});

    });

    function filterMatchResults(matchs){
        if (!matchs) return;                                            // 叶节点

        if (!(Array.isArray(matchs) || matchs instanceof Array)) {
            return filterMatchResults(matchs.matchs);                   // 非数组，子节点继续
        }

        matchs.length > 1 && filterMatchs(matchs);                      // 过滤

        matchs.forEach(ary => filterMatchResults(ary));                 // 子节点继续过滤
    }

    function filterMatchs(matchs){
        // 过滤
        let oReturn = null;
        for (let i=0,match; match=matchs[i++]; ) {
            if (match.type === NodeTypes.Return) {
                oReturn = match;
                break;                                                  // Return句型有独占性，其他即使匹配也忽略掉
            }
        }
        if (oReturn) {
            matchs.length = 0;
            matchs.push([oReturn]);
        }
    }

}());

