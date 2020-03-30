const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 识别【表头最大列】
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet; oSheet=context.Sheets[i++];  ){
            if ( oSheet.ignore ) continue;                                      // 跳过忽略的Sheet

            oSheet.maxHeadColumn = guessMaxHeadColumn(context, oSheet);         // 表头最大列
        }

    });

}());

function guessMaxHeadColumn(context, oSheet){
    let sheet = context.workbook.sheet(oSheet.name);
    for (let i=oSheet.maxColumn; i>0; i--) {
        if ( bus.at('右边框线', sheet, oSheet, 1, i) ) {
            return i;                                                           // 第一行最后一个有右边框线的列就是表头的最后列
        }
    }
    return 0;
}
