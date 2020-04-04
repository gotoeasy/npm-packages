bus.on('解析器插件', function(){
    
    // 单个参数，反推初始化方法参数
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.Method, (node, object) => {

            if (/hello/i.test(object.value)) {
                object.methodNmae = 'hello';
            }

        }, {readonly:true});

    });

}());

