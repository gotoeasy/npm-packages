const bus = require('@gotoeasy/bus');

// 取出边框表格行的整行边框单元格位置（最终结构效果如同Table的Tr）
bus.on('边框表格全部行位置', function(){
    
    return function (sheet, oSheet, iRow, iColumn, maxRow, maxColumn) {
        if ( !iRow || !iColumn ) {
            return null;                                                                            // 参数不对
        }

        let oSet = new Set();                                                                       // 存放已被找出占用的单元格

        let positions = [], aryTr = [];
        let oPos = bus.at('边框单元格位置', sheet, oSheet, iRow, iColumn, maxRow, maxColumn);
        if ( oPos ) {
            aryTr.push(oPos);
            saveFoundCell(oSet, oPos);                                                              // 缓存已被找出来的单元格
            positions.push(aryTr);
        }else{
            return positions;                                                                       // 根本就不是表格
        }

        // 第一行直接按右边紧邻关系，找出首行的全部边框单元格
        while ( oPos = bus.at('右边框单元格位置', sheet, oSheet, oPos, maxRow, maxColumn) ) {
            saveFoundCell(oSet, oPos);                                                              // 缓存已被找出来的单元格
            aryTr.push(oPos);
        }

        // 接下去从第二行开始逐行递增，遍历全部单元格，逐个确认找出所有边框单元格
        for (let row=iRow+1,tr; row<=maxRow; row++ ) {
            tr = getRowBorderCells(sheet, oSheet, oSet, row, iColumn, maxRow, maxColumn);           // 一个不落的找
            tr.length && positions.push(tr);                                                        // 该行有才推入数组
        }

        return positions;
    }

    // 指定行逐个确认查找边框单元格
    function getRowBorderCells(sheet, oSheet, oSet, row, iColumn, maxRow, maxColumn){

        let cells = [];
        for (let column=iColumn,oPos; column<=maxColumn; column++) {
            if ( oSet.has(`${row},${column}`) ) continue;                                           // 跳过已找出来的单元格

            oPos = bus.at('边框单元格位置', sheet, oSheet, row, column, maxRow, maxColumn);
            saveFoundCell(oSet, oPos);                                                              // 缓存已被找出来的单元格
            oPos && cells.push(oPos);
        }
        return cells;
    }

    // 缓存已被找出来的单元格
    function saveFoundCell(oSet, oPos){
        if ( !oPos ) return;

        for (let row=oPos.startRow; row<=oPos.endRow; row++) {
            for (let column=oPos.startColumn; column<=oPos.endColumn; column++) {
                oSet.add(`${row},${column}`);                                                       // 这个单元格已被找出来了
            }
        }
    }

}());

// 查找紧邻右边的边框单元格位置（仅限简易二维表格）
bus.on('右边框单元格位置', (sheet, oSheet, oPos, maxRow, maxColumn) => {
    if ( !oPos ) return null;

    return bus.at('边框单元格位置', sheet, oSheet, oPos.startRow, oPos.endColumn+1, maxRow, maxColumn);
});

// 通过边框线判断所在边框单元格位置（参数位置应该是边框单元格的起始位置）
bus.on('边框单元格位置', (sheet, oSheet, iRow, iColumn, maxRow, maxColumn) => {
    if ( !iRow || !iColumn ) {
        return null;                                                                            // 参数不对
    }

    let startRow = iRow;
    let endRow = 0;
    let startColumn = iColumn;
    let endColumn = 0;

    // -----------------------------------------------------------------
    // 传入的地址属于合并单元格的起始位置，直接用合并单元格的位置信息
    // -----------------------------------------------------------------
    let mergeAddr = bus.at('所属合并单元格的位置', oSheet, iRow, iColumn);
    if ( mergeAddr ) {
        endRow = mergeAddr.endRow;
        endColumn = mergeAddr.endColumn;
        return {startRow, endRow, startColumn, endColumn};                                      // 既然合并了单元格，理应有边框线，不必再看，直接返回
    }

    // -----------------------------------------------------------------
    // 不是合并单元格，逐个单元格判断边框线决定
    // -----------------------------------------------------------------
    for (let row=startRow,max=maxRow||(startRow+100); row<=max; row++) {
        if ( bus.at('下边框线', sheet, oSheet, row, startColumn) ) {
            endRow = row;                                                                       // 找到结束行
            break;
        }
    }
    if ( !endRow ) return null;                                                                 // 找不到边框线，返回null

    for (let column=startColumn,max=maxColumn||(startColumn+100); column<=max; column++) {
        if ( bus.at('右边框线', sheet, oSheet, startRow, column) ) {
            endColumn = column;                                                                 // 找到结束列
            break;
        }
    }
    if ( !endRow ) return null;                                                                 // 找不到边框线，返回null

    return {startRow, endRow, startColumn, endColumn};
});
