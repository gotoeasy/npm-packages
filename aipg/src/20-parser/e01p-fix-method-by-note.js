bus.on('解析器插件', function(){
    
    // 顶级方法节点
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.Note, (node, object) => {

            if (node.findParent(Types.SheetSection).parent.parent.type === Types.Excel) {
                node.type = Types.MethodNote;
                node.findParent(Types.SheetSection).object.type = Types.Method;
            }

        });

    });



}());

