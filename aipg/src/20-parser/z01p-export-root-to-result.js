bus.on('解析器插件', function(){
    
    // 解析结果添加接口方便查看节点
    return postobject.plugin(/**/__filename/**/, async function(root, context){
        context.root = ()=>root;
    });

}());

