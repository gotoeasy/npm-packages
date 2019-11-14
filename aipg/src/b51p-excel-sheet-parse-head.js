const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 解析Sheet【表头】
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet; oSheet=context.Sheets[i++]; ){
            if ( oSheet.ignore ) continue;                                      // 跳过忽略的Sheet

            parseSheetHead(context, oSheet);
        }
    });

}());

function parseSheetHead(context, oSheet){
    let sheet = context.workbook.sheet(oSheet.name);

    let trs = bus.at('边框表格全部行位置', sheet, oSheet, 1, 1, oSheet.maxHeadRow, oSheet.maxHeadColumn);
    console.info('---------trs-------', trs)
    let oHead = {trs};
    oSheet.Head = oHead;
}