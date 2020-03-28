bus.on('单元格背景色', (sheet, oSheet, iRow, iColumn) => {
    if ( !iRow || !iColumn ) {
        return null;                                                                // 参数不对
    }

    let map = oSheet.mapMergeCell;
    let addr = bus.on('数字转列名', iColumn) + iRow;
    if ( map.has(addr) ) {
        return map.get(addr);                                                       // 按合并单元格起始地址直接找到
    }

    let oCell = sheet.cell(addr.cell);

    return oCell;                                                                    // 找不到

});
