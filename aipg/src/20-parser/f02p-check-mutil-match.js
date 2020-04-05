bus.on('解析器插件', function(){
    
    // TODO 检查匹配结果
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.MatchSections, (node, object) => {
            if (node.nodes.length < 2) return;

            let ndExcel = node.findParent(Types.Excel);
            let ndSection = node.findParent(Types.SheetSection);
            ndSection.object.unmatch = true;

            let type = '难以抉择';
            let file = ndExcel.object.file;
            let cell = ndSection.object.cell;
            let value = ndSection.object.value;
            bus.at('QA', {type, file, cell, value});

        }, {readonly: true});


    });


}());

