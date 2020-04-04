bus.on('解析器插件', function(){
    
    // 单个参数，反推初始化方法参数
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.Parameter, (node, object) => {

            let guessType, flg;
            let oParam;
            let parentNode = node.parent;
            while (true) {
                if (parentNode.type === Types.Method) {
                    oParam = parentNode.object.parameters[0];
                    break;
                }else if (parentNode.type === Types.Add && !flg) {
                    let nd = parentNode.getChild(0) === node ? parentNode.getChild(1) : parentNode.getChild(0);
                    guessType = nd.type;
                    flg = true;
                }else if (parentNode.type === Types.Excel) {
                    break;                                      // 不应该完全找不到
                }
                parentNode = parentNode.parent;
            }

            if (!oParam.type && guessType) {
                oParam.type = guessType;
            }
            node.type = Types.Var;
            object.type = oParam.type;

        }, {readonly:true});

    });

}());

