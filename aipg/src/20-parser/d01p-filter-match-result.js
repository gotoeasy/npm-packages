bus.on('解析器插件', function(){
    
    // 初始化节点的章节类型
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( NodeTypes.SheetSection, (node, object) => {
            if (object.matchs.length < 2) return;

            let ary = null;
            for (let i=0,match; match=object.matchs[i++]; ) {
                if (match.type === NodeTypes.Return) {
                    ary = [match];
                    break;
                }
            }
            if (ary) {
                object.matchs = ary;
            }

        }, {readonly: true});

    });

}());

