bus.on('解析器插件', function(){
    
    // 单个参数，反推初始化方法参数
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.SheetSection, (node, object) => {

            // TODO

            if (/hello/i.test(object.value)) {
                node.findParent(Types.Excel).object.className = 'HelloWorld';
            }

        }, {readonly:true});

    });

}());

