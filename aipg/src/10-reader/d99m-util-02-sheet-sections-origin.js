bus.on('读取章节', function (sheet, oSheet){
    let contents = bus.at('顺序通读', sheet, oSheet);
    // console.info( JSON.stringify(contents,null,2))
    return bus.at('整理章节', sheet, oSheet, contents);
});


bus.on('顺序通读', function (sheet, oSheet){

    let iStartColumn, aryVal, contents = [];

    for (let row=oSheet.maxHeadRow+1; row<=oSheet.maxRow; row++ ) {

        iStartColumn = bus.at('边框表格首行开始列', sheet, oSheet, row);
        if ( iStartColumn ) {
            aryVal = bus.at('读边框表格', sheet, oSheet, row, iStartColumn);                            // 表格对象
            row = aryVal.endRow;                                                                        // 表格末行
        }else{
            aryVal = bus.at('读行单元格', sheet, oSheet, row);                                          // 返回数组
        }

        contents.push(aryVal);
    }

    let rs = [];
    for (let i=0,aryLine; i<contents.length; i++) {
        aryLine = contents[i];

        if ( aryLine.length || aryLine.endRow ) {
            if ( aryLine.length === 1 && aryLine[0].delete ){
                continue;                                                                               // 过滤删除行
            }
            rs.push(aryLine);
        }else{
            rs[rs.length-1] && (rs[rs.length-1].length || rs[rs.length-1].endRow) && rs.push(aryLine);  // 重复空行仅保留一行
        }

    }

    rs = bus.at('同段文本合并', rs);
    rs = rs.filter(v => v && (!v.values || v.values.length));                                           // 过滤没有内容文本章节

    // TODO 表格的头部脚部文本，表头识别
    return rs;
});

bus.on('同段文本合并', function (contents){

    if ( !contents.length ) return [];

    let rs = [], oSec, values;
    for (let i=0; i<contents.length; i++) {
        values = contents[i];
        if ( values ) {
            if ( values.endRow ) {
                rs.push({table: values.trs, endRow:values.endRow, startColumn:values.startColumn});     // 表格
                oSec = null;
            }else if (values.length){
                if ( !oSec ) {
                    rs.push(oSec = {values});                                                           // 起始文本章节
                }else{
                    if ( bus.at('章节编号', values[0]) ) {
                        rs.push(oSec = {values});                                                       // 有章节编号，按新章节处理
                    }else{
                        oSec.values.push(...values);                                                    // 没有章节编号的做合并处理
                    }
                }
            }else{
                rs.push(oSec = null);                                                                   // 空行
            }
        }else{
            rs.push(oSec = null);                                                                       // 空行
        }
    }

    return rs;
});

bus.on('读边框表格', function (sheet, oSheet, iStartRow, iStartColumn){


    let maxRow = bus.at('边框表格结束行', sheet, oSheet, iStartRow, iStartColumn);
    let maxColumn = bus.at('边框表格结束列', sheet, oSheet, iStartRow, iStartColumn);

    let trs = bus.at('边框表格全部行位置', sheet, oSheet, iStartRow, iStartColumn, maxRow, maxColumn);
    let startColumn = trs[0][0].startColumn;
    let endRow = trs[trs.length-1][0].endRow;

    for (let i=0,tds; tds=trs[i++]; ) {
        for (let j=0,td; td=tds[j++]; ) {
            td.Value = bus.at('读值', sheet, oSheet, td.startRow, td.startColumn);
        }
    }

    for (let i=0; i<trs.length; i++) {
        trs[i].length === 1 && trs[i][0].delete && (trs[i] = null);
    }
    trs = trs.filter(tr => !!tr);                                                                       // 过滤删除行

    return {trs, endRow, startColumn};
});

bus.on('读行单元格', function (sheet, oSheet, row){

    let values = [], oDelete = null;
    for (let column=1,oVal; column<=oSheet.maxColumn; column++) {
        oVal = bus.at('读值', sheet, oSheet, row, column);
        oVal.value.trim() && values.push(oVal);
        !oDelete && oVal.delete && (oDelete = oVal);
    }

    if ( values.length ) {
        return values;                                                                                  // 正常有值时返回的是数组
    }else if ( oDelete ) {
        return [oDelete];                                                                               // 删除行时，数组仅含首个删除单元格
    }else{
        return values;                                                                                  // 空行时返回的是空数组
    }

});
