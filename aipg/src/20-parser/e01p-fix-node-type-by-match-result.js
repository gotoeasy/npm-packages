bus.on('解析器插件', function(){
    
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( NodeTypes.SheetSection, (node, object) => {
            if (object.matchs && object.matchs.length === 1) {
                node.type = object.matchs[0].type;                          // 精确匹配到一个句型，节点类型直接替换
            }
        }, {readonly: true});

    });

}());

