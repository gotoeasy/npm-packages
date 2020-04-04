bus.on('解析器插件', function(){
    
    // 根据匹配结果，整理成相应节点
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.SheetSection, (node, object) => {

            let fnAddChild = (parent, obj) => {
                let oChild = this.createNode(obj);
                parent.addChild( oChild );

                obj.matchs && obj.matchs.forEach(m => fnAddChild(oChild, m));
                delete oChild.object.matchs;
            };

            if (object.matchs.length === 1) {
                if (!object.matchs[0].matchs) {
                    node.type = object.matchs[0].type;
                    delete object.matchs;
                }else{
                    let oClone = node.clone();
                    oClone.type = object.matchs[0].type;
                    node.replaceWith(oClone);

                    object.matchs[0].matchs.forEach(m => {
                        fnAddChild(oClone, m);
                    });
                    delete oClone.object.matchs;

                }
            }else{
                // TODO 多匹配？
            }

        });

    });



}());

