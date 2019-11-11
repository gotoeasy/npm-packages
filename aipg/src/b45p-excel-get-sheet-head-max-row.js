const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 识别【表头最大行】
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet; oSheet=context.Sheets[i++];  ){
            if ( oSheet.ignore ) continue;                                      // 跳过忽略的Sheet

            oSheet.maxHeadRow = guessMaxHeadRow(context, oSheet);               // 表头最大行
        }

    });

}());

// 在前10行内猜测表头最大行
function guessMaxHeadRow(context, oSheet){
    let sheet = context.workbook.sheet(oSheet.name);

    // 前10行最后列有底线的行都存起来
    let rows = [];
    for (let i=1; i<10; i++) {
        hasBottomBorder(sheet, i, oSheet.maxHeadColumn) && rows.push(i);
    }

    // 最后一个全有底线的行就是表头结束行了
    for (let iRow; iRow=rows.pop(); ) {
        if ( hasFullRowBottomBorder(sheet, iRow, oSheet.maxHeadColumn) ) {
            return iRow;
        }
    }

    return 0;
}

// 判断指定单元格有没有底线
function hasBottomBorder(sheet, iRow, maxColumn){
    let curCell = sheet.row(iRow).cell(maxColumn);
    let nextCell = sheet.row(iRow+1).cell(maxColumn);
    return !!curCell.style('border').bottom || !!nextCell.style('border').top;    // 当前单元格有底线，或下一行单元格有上线
}

// 判断是否整行都有底线
function hasFullRowBottomBorder(sheet, iRow, maxColumn){

    if ( iRow < 1 || maxColumn < 1 ) return false;

    for (let iColumn=maxColumn; iColumn>0; iColumn--) {
        if ( !hasBottomBorder(sheet, iRow, iColumn) ) {
            return false;
        }
    }
    return true;
}

