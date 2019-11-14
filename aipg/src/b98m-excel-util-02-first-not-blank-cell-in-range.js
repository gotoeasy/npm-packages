const bus = require('@gotoeasy/bus');

// 在指定范围内找出非空白的起始单元格
bus.on('非空白起始单元格', function (sheet, iStartRow, iEndRow, iStartColumn, iEndColumn){
    for (let row=iStartRow,value; row<iEndRow; row++) {
        for (let column=iStartColumn; column<=iEndColumn; column++) {
            value = sheet.row(row).cell(column).value();
            if ( bus.at('非空白', value) ) {
                return {row, column};
            }
        }
    }
    return null; // 找不到返回null
});
