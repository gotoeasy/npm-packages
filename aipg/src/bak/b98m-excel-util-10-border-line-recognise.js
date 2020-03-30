const bus = require('@gotoeasy/bus');

// 边框线识别

bus.on('上边框线', function (sheet, oSheet, iRow, iColumn){
    if ( !iRow || !iColumn ) {
        return false;                                                       // 参数不对
    }else if ( sheet.row(iRow).cell(iColumn).style('border').top ) {
        return true;                                                        // 有的
    }else if ( iRow <= 1 ) {
        return false;                                                       // 边界了
    }else{
        return sheet.row(iRow-1).cell(iColumn).style('border').bottom;      // 也有的
    }
});

bus.on('下边框线', function (sheet, oSheet, iRow, iColumn){
    if ( !iRow || !iColumn ) {
        return false;                                                       // 参数不对
    }else if ( sheet.row(iRow).cell(iColumn).style('border').bottom ) {
        return true;                                                        // 有的
    }else{
        return sheet.row(iRow+1).cell(iColumn).style('border').top;         // 也有的
    }
});

bus.on('左边框线', function (sheet, oSheet, iRow, iColumn){
    if ( !iRow || !iColumn ) {
        return false;                                                       // 参数不对
    }else if ( sheet.row(iRow).cell(iColumn).style('border').left ) {
        return true;                                                        // 有的
    }else if ( iColumn <= 1 ) {
        return false;                                                       // 边界了
    }else{
        return sheet.row(iRow).cell(iColumn-1).style('border').right;       // 也有的
    }
});

bus.on('右边框线', function (sheet, oSheet, iRow, iColumn){
    if ( !iRow || !iColumn ) {
        return false;                                                       // 参数不对
    }else if ( sheet.row(iRow).cell(iColumn).style('border').right ) {
        return true;                                                        // 有的
    }else{
        return sheet.row(iRow).cell(iColumn+1).style('border').left;        // 也有的
    }
});


bus.on('全有上边框线', function (sheet, oSheet, iRow, iStartColumn, iEndColumn){
    if ( !iRow || !iStartColumn || !iEndColumn || iStartColumn>iEndColumn ) {
        return false;                                                       // 参数不对
    }

    let has = true;
    for (let column=iStartColumn; column<=iEndColumn; column++ ) {
        if ( !bus.at('上边框线', sheet, oSheet, iRow, column) ) {
            return false;
        }
    }
    return has;

});

bus.on('全有下边框线', function (sheet, oSheet, iRow, iStartColumn, iEndColumn){
    if ( !iRow || !iStartColumn || !iEndColumn || iStartColumn>iEndColumn ) {
        return false;                                                       // 参数不对
    }

    let has = true;
    for (let column=iStartColumn; column<=iEndColumn; column++ ) {
        if ( !bus.at('下边框线', sheet, oSheet, iRow, column) ) {
            return false;
        }
    }
    return has;

});

bus.on('全有左边框线', function (sheet, oSheet, iColumn, iStartRow, iEndRow){
    if ( !iColumn || !iStartRow || !iEndRow || iStartRow>iEndRow ) {
        return false;                                                       // 参数不对
    }

    let has = true;
    for (let row=iStartRow; row<=iEndRow; row++ ) {
        if ( !bus.at('左边框线', sheet, oSheet, row, iColumn) ) {
            return false;
        }
    }
    return has;

});

bus.on('全有右边框线', function (sheet, oSheet, iColumn, iStartRow, iEndRow){
    if ( !iColumn || !iStartRow || !iEndRow || iStartRow>iEndRow ) {
        return false;                                                       // 参数不对
    }

    let has = true;
    for (let row=iStartRow; row<=iEndRow; row++ ) {
        if ( !bus.at('右边框线', sheet, oSheet, row, iColumn) ) {
            return false;
        }
    }
    return has;

});

bus.on('全有边框线', function (sheet, oSheet, iStartRow, iEndRow, iStartColumn, iEndColumn){
    if ( !iStartRow || !iEndRow || iStartRow>iEndRow || !iStartColumn || !iEndColumn || iStartColumn>iEndColumn ) {
        return false;                                                       // 参数不对
    }

    return bus.at('全有上边框线', sheet, oSheet, iStartRow, iStartColumn, iEndColumn)
        && bus.at('全有下边框线', sheet, oSheet, iEndRow, iStartColumn, iEndColumn)
        && bus.at('全有左边框线', sheet, oSheet, iStartColumn, iStartRow, iEndRow)
        && bus.at('全有右边框线', sheet, oSheet, iEndColumn, iStartRow, iEndRow);

});
