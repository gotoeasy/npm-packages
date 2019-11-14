const bus = require('@gotoeasy/bus');

// 给定一个单元格地址，找出其所属的合并单元格地址，没有则返回空
bus.on('所属合并单元格的位置', (oSheet, iRow, iColumn) => {
    if ( !iRow || !iColumn ) {
        return null;                                                                // 参数不对
    }

    let map = oSheet.mapMergeCell;
    let addr = bus.on('数字转列名', iColumn) + iRow;
    if ( map.has(addr) ) {
        return map.get(addr);                                                       // 按合并单元格起始地址直接找到
    }

    for( let oAddr of map.values() ){                                               // 遍历合并单元格，确认是否在其中
        if ( iRow >= oAddr.startRow && iRow <= oAddr.endRow && iColumn >= oAddr.startColumn && iColumn <= oAddr.endColumn ) {
            return oAddr;                                                           // 找到
        }
    }

    return null;                                                                    // 找不到

});

// 判断是否属于某个合并单元格的起始单元格位置
bus.on('是否合并单元格起始位置', (oSheet, iRow, iColumn) => {
    if ( !iRow || !iColumn ) {
        return false;                                                                // 参数不对
    }

    let map = oSheet.mapMergeCell;
    let addr = bus.at('数字转列名', iColumn) + iRow;
    return map.has(addr);

});
