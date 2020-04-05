bus.on('解析器插件', function(){
    
    // TODO 检查匹配结果
    return postobject.plugin(/**/__filename/**/, async function(root, context){

    require("@gotoeasy/file").write('e:/1/generator-unmmmm.json', JSON.stringify(root, null, 2));

        await root.walk( Types.UnMatch, (node, object) => {
            let type = '不知所云';
            let cell = object.cell;
            let value = object.value;
            if (cell) {
                bus.at('QA', {type, cell, value});
            }else{

                let parentNode = node.parent;
                while (true) {
                    if (parentNode.object.cell) {
                        cell = parentNode.object.cell;
                        break;
                    }else if (parentNode.type === Types.Excel) {
                        break;                                      // 不应该完全找不到
                    }
                    parentNode = parentNode.parent;
                }
                bus.at('QA', {type, cell, value});

            }
        }, {readonly: true});

    });


}());

