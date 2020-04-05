bus.on('解析器插件', function(){
    
    // 单个参数，反推初始化方法参数
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.Parameter, (node, object) => {

            let ndMethod = node.findParent(Types.Method);
            let oParam = ndMethod.object.parameters[0];

            // -------------------------------------
            // 【方法】已有参数类型定义时直接使用
            // -------------------------------------
            if (oParam.type) {
                node.type = Types.Var;                                      // 设定节点类型为Var
                object.type = oParam.type;                                  // 设定参数类型
                return;
            }

            // -------------------------------------
            // 【加法】时，尝试参考兄弟节点推测类型
            // -------------------------------------
            if (node.parent.type === Types.Add) {
                let ndBrother = node.findBrother(nd=>nd!==this);
                if (ndBrother && ndBrother.type) {
                    oParam.type = ndBrother.type;                           // 设定方法的参数类型
                    node.type = Types.Var;                                  // 设定节点类型为Var
                    object.type = oParam.type;                              // 设定参数类型
                    return;
                }
            }

        }, {readonly:true});

    });

}());

