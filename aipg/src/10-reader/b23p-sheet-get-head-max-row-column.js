bus.on('阅读器插件', function(){
    
    // 识别【表头最大列】
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet; oSheet=context.Sheets[i++];  ){
            if ( oSheet.ignore ) continue;                                      // 跳过忽略的Sheet

            oSheet.maxHeadColumn = guessMaxHeadColumn(context, oSheet);         // 表头最大列
            oSheet.maxHeadRow = guessMaxHeadRow(context, oSheet);               // 表头最大行
        }

    });

    function guessMaxHeadColumn(context, oSheet){
        let sheet = context.workbook.sheet(oSheet.name);
        for (let i=oSheet.maxColumn; i>0; i--) {
            if ( bus.at('右边框线', sheet, oSheet, 1, i) ) {
                return i;                                                           // 第一行最后一个有右边框线的列就是表头的最后列
            }
        }
        return 0;
    }

    // 在前10行内猜测表头最大行
    function guessMaxHeadRow(context, oSheet){
        let sheet = context.workbook.sheet(oSheet.name);

        // 前10行最后列有底线的行都存起来
        let rows = [];
        for (let i=1; i<10; i++) {
            bus.at('下边框线', sheet, oSheet, i, oSheet.maxHeadColumn) && rows.push(i);
        }

        // 最后一个全有底线的行就是表头结束行了
        for (let iRow; iRow=rows.pop(); ) {
            if ( bus.at('全有下边框线', sheet, oSheet, iRow, 1, oSheet.maxHeadColumn) ) {
                return iRow;
            }
        }

        return 0;
    }

}());
