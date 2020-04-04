bus.on('解析器插件', function(){
    
    // 单个参数，反推初始化方法参数
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.Parameter, (node, object) => {

            let parentNode = node.parent;
            while (true) {
                if (parentNode.type === Types.Method) {
                    let parameters = parentNode.object.parameters = parentNode.object.parameters || [];
                    if (!parameters.length) {
                        object.name = object.value;
                        let type = null;                        // 参数类型未知
                        let name = object.name;                 // 参数名称
                        let value = object.value = 'arg';       // 参数变量名
                        parameters.push({type, name, value});
                        break;
                    }
                }else if (parentNode.type === Types.Excel) {
                    break;                                      // 不应该完全找不到
                }
                parentNode = parentNode.parent;
            }

        }, {readonly:true});

    });

}());

