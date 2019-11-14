const bus = require('@gotoeasy/bus');

// 边框表格识别（看上去有线框的表格，识别出范围地址）
// 指定一个单元格，判断是否在边框表格中，是的话返回边框表格的位置信息{startRow, endRow, startColumn, endColumn}，否则返回null
// （指定的单元格通常应该是边框表格的首行）
bus.on('边框表格位置', function (sheet, oSheet, iRow, iColumn){
    if ( !iRow || !iColumn ) return null;

    // 位置{row, column}
    let oPos = bus.at('非空白起始单元格', sheet, iRow, oSheet.maxRow, iColumn, oSheet.maxColumn);
    if ( !oPos ) return null;

    if ( !bus.at('上边框线', sheet, oSheet, oPos.row, oPos.column) ) {
        return null;                                                            // 没有上边框线，不是表格（首行应当有上边框线）
    }

    // 有戏，开始找范围
    let startRow, endRow, startColumn, endColumn;
    startRow = endRow = iRow;
    startColumn = endColumn = oPos.column;

    for (let i=startColumn-1; i>0; i--) {
        if ( bus.at('上边框线', sheet, oSheet, startRow, i) ) {
            startColumn = i;                                                    // 开始列
        }else{
            break;
        }
    }
    for (let i=startColumn+1; i<=oSheet.maxHeadColumn; i++) {
        if ( bus.at('上边框线', sheet, oSheet, startRow, i) ) {
            endColumn = i;                                                      // 结束列
        }else{
            break;
        }
    }

    for (let i=startRow+1; i<=oSheet.maxHeadRow; i++) {
        if ( bus.at('左边框线', sheet, oSheet, i, startColumn) ) {
            endRow = i;                                                         // 结束行
        }else{
            break;
        }
    }

    // TODO 没有左右边框线的表格 ...

    return {startRow, endRow, startColumn, endColumn};
});

