bus.on('解析器插件', function(){
    
    // 初始化节点的章节类型
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( (node, object) => {
            if (node.type === NodeTypes.Unknown) {
                node.type = NodeTypes.SheetSection;             // 仅章节没有类型
            }
            delete object.type;                                 // 数据不存放type
        }, {readonly: true});


    });

}());

