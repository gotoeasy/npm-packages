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
        if ( hasRightBorder(sheet, i) ) {
            return i;                                                           // 第一行最后一个有右边框线的列就是表头的最后列
        }
    }
    return 0;
}

function hasRightBorder(sheet, iColumn){
    let curCell = sheet.row(1).cell(iColumn);
    let nextCell = sheet.row(1).cell(iColumn+1);
    return !!curCell.style('border').right || !!nextCell.style('border').left;  // 当前单元格有右线，或下一列单元格有左线
}
