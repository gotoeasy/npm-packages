bus.on('解析器插件', function(){
    
    // 单个参数，反推初始化方法参数
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.Parameter, (node, object) => {

            let ndMethod = node.findParent((nd,obj)=>obj.type === Types.Method);
            let parameters = ndMethod.object.parameters = ndMethod.object.parameters || [];
            if (!parameters.length) {
                object.name = object.value;                     // 参数名称
                let type = null;                                // 参数类型未知
                let name = object.name;                         // 参数名称
                let value = object.value = 'arg';               // 参数变量名
                parameters.push({type, name, value});
            }

        }, {readonly:true});

    });

}());

