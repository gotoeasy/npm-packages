// 匹配结果在数组中，直接筛选修改数组
bus.on('筛选匹配结果', function(){

    return function(matchs){
        if (!matchs) return;                                            // 叶节点

        filterMatchs(matchs);                                           // 过滤数组
        matchs.forEach(m => bus.at('筛选匹配结果', m.matchs));           // 子节点继续过滤
    }

    function filterMatchs(matchs){

        // ----------------------------------------------
        // 过滤：只有一个匹配，不用选了
        // ----------------------------------------------
        if (matchs.length === 1) {
            return;                                                     // 仅一项，不必再选了
        }

        // ----------------------------------------------
        // 过滤：有完全匹配项时，仅保留完全匹配项
        // ----------------------------------------------
        let oks = [];
        matchs.forEach(m => {
            m.ok && oks.push(m);
        });
        if (oks.length) {
            matchs.length = 0;
            matchs.push(...oks);
            if (matchs.length === 1) {
                return;                                                 // 仅剩一项，不必再选了
            }
        }

        // ----------------------------------------------
        // 过滤：Return句型有独占性，其他即使匹配也忽略掉
        // ----------------------------------------------
        let oReturn = null;
        for (let i=0,match; match=matchs[i++]; ) {
            if (match.type === Types.Return) {
                oReturn = match;
                break;
            }
        }
        if (oReturn) {
            matchs.length = 0;
            matchs.push(oReturn);
            return;                                                     // 仅剩一项，不必再选了
        }
    }

}());
