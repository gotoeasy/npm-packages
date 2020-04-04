bus.on('阅读器插件', function(){
    
    // 整理有效Sheet的内容存入context.result
    return postobject.plugin(/**/__filename/**/, function(root, context){

        let oExcel = {type: Types.Excel, file: context.input.file, nodes:[]};

        for (let i=0,oSheet,sheet; oSheet=context.Sheets[i++]; ){
            if ( oSheet.ignore ) continue;                                                      // 跳过忽略的Sheet

            let type = oSheet.type;
            let name = oSheet.name;
            let nodes = [];
            oExcel.nodes.push({type, name, nodes});                                             // Sheet

            nodes.push({type: Types.SheetHead, header: oSheet.Head});                       // SheetHead
            oSheet.Sections && oSheet.Sections.nodes && nodes.push(...oSheet.Sections.nodes);   // Sections
        }

        context.result = oExcel;
    });

}());

