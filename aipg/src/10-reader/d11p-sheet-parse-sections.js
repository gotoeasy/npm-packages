bus.on('阅读器插件', function(){
    
    // 读取Sheet的【章节】
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet,sheet; oSheet=context.Sheets[i++]; ){
            if ( oSheet.ignore ) continue;                              // 跳过忽略的Sheet

            sheet = context.workbook.sheet(oSheet.name);
            oSheet.Sestions = bus.at('读取章节', sheet, oSheet);
        }

    });

}());

