bus.on('解析器插件', function(){
    
    // 根据匹配结果，整理成相应子节点
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( (node, object) => {
            if (node.type === NodeTypes.UnMatch || !object.matchs || object.matchs.length !== 1) return;

            let matchs = object.matchs[0].matchs || [];
            for (let i=0,oMatch; oMatch=matchs[i++]; ) {
                let oChild = this.createNode(oMatch);
                node.addChild( oChild );
            }

            delete object.matchs;
        });

    });


}());

