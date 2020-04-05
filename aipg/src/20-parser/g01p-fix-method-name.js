bus.on('解析器插件', function(){
    
    // 单个参数，反推初始化方法参数
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.SheetSection, (node, object) => {

            if (object.type !== Types.Method || object.methodName) return;          // 非方法或已有方法名都略过

            if (/hello/i.test(object.value)) {
                object.methodName = 'hello';
            }else{
                object.methodName = 'todo';         // TODO
            }

        }, {readonly:true});

    });

}());

