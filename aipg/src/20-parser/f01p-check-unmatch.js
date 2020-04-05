bus.on('解析器插件', function(){
    
    // TODO 检查匹配结果
    return postobject.plugin(/**/__filename/**/, async function(root, context){

    require("@gotoeasy/file").write('e:/1/generator-unmmmm.json', JSON.stringify(root, null, 2));

        await root.walk( Types.UnMatch, (node, object) => {

            let ndExcel = node.findParent(Types.Excel);
            let ndSection = node.findParent(Types.SheetSection);
            ndSection.object.unmatch = true;

            let type = '不知所云';
            let file = ndExcel.object.file;
            let cell = ndSection.object.cell;
            let value = ndSection.object.value;
            bus.at('QA', {type, file, cell, value});

        }, {readonly: true});

    });


}());

