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
    let val, oHead = {};
    let sheet = context.workbook.sheet(oSheet.name);

    for (let i=1; i<oSheet.maxHeadRow; i++ ) {
        for (let j=1; j<oSheet.maxHeadColumn; j++ ) {
            val = sheet.row(i).cell(j).value();
            val !== undefined && (oHead[`${i},${j}`] = val);                    // TODO 有值的都存起来
        }
    }
    oSheet.Head = oHead;
}