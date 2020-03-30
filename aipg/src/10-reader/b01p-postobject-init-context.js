bus.on('阅读器插件', function(){
    
    // 处理输入文件（单个源文件的单一节点），输入{file，hashcode}
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        context.input = {};                             // 存放输入（file，hashcode）
        context.result = {};                            // 存放结果

        // 保存原始输入（file、hashcode）
        await root.walk( (node, object) => {
            context.input.file = object.file            // 文件名
            context.input.hashcode = object.hashcode;   // 文件哈希码
        }, {readonly: true});

    });

}());

