bus.on('解析器插件', function(){
    
    // 反推方法参数
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.Note, (node, object) => {

            if (object.seq.length === 2) {
                node.type = Types.Method;
            }

        });

    });



}());

