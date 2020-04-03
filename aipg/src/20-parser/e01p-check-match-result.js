bus.on('解析器插件', function(){
    
    // 检查匹配结果
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( NodeTypes.SheetSection, (node, object) => {
            let warn = [];
            checkMatchResults(object.matchs, warn);
            if (warn.length) {
                console.info('[TODO]', JSON.stringify({object, warn}, null, 2));
            }
        }, {readonly: true});

    });

    function checkMatchResults(matchs, ary){
        if (!matchs || !matchs.length) return;

        if (matchs.length > 1) {
            ary.push(matchs);
        }

        matchs.forEach(match => checkMatchResults(match.matchs, ary));
    }

}());

