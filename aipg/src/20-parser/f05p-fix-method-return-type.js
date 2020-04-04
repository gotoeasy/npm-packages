bus.on('解析器插件', function(){
    
    // 单个参数，反推初始化方法参数
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.Method, async (node, object) => {
            if (object.returnType) {
                return;                                                 // 已经有返回类型了
            }

            let ndReturn;
            await node.walk(Types.Return, (nd) => {
                ndReturn = nd;
                return false;
            }, {readonly:true});

            if (!ndReturn) {
                object.returnType = 'void';
                return;                                                 // void
            }

            let returnType;
            await ndReturn.walk((nd, obj) => {
                if (obj.value !== undefined && obj.type) {
                    returnType = obj.type;                              // 使用某个变量的类型
                    return false;
                }
            }, {readonly:true});

            object.returnType = returnType || 'void';

        }, {readonly:true});

    });

}());

