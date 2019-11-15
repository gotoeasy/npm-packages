const bus = require('@gotoeasy/bus');


bus.on('读取章节', function (sheet, oSheet){
    let contents = bus.at('顺序通读', sheet, oSheet);
    return bus.at('整理章节', sheet, oSheet, contents);
});

bus.on('整理章节', function (sheet, oSheet, contents){
    // TODO
    let sections = contents;

    return sections;
});


bus.on('顺序通读', function (sheet, oSheet){

    let iStartColumn, oVal, contents = [];

    for (let row=oSheet.maxHeadRow+1; row<=oSheet.maxRow; row++ ) {

        iStartColumn = bus.at('边框表格首行开始列', sheet, row);
        if ( iStartColumn ) {
            oVal = bus.at('读边框表格', sheet, oSheet, row, iStartColumn);                  // 表格对象或空串
        }else{
            oVal = bus.at('读行单元格', sheet, oSheet, row);                                // 单元格对象数组或空串
        }

        if ( oVal ) {
            contents.push(oVal);
        }else{
            contents.length && contents[contents.legnth-1] && contents.push(oVal);          // 空行占个位便于后续判断
        }
    }

    return contents;
});


bus.on('读边框表格', function (sheet, oSheet, iStartRow, iStartColumn){

    let trs = bus.at('边框表格全部行位置', sheet, oSheet, iStartRow, oSheet.maxRow, iStartColumn, oSheet.maxColumn);

    for (let i=0,tds; tds=trs[i++]; ) {
        for (let j=0,td; td=tds[j++]; ) {
            td.value = bus.at('读值', sheet, oSheet, td.startRow, td.startColumn);
        }
    }

    return trs;
});

bus.on('读行单元格', function (sheet, oSheet, row){

    let values = [];
    for (let column=1,oVal; column<=oSheet.maxColumn; column++) {
        oVal = bus.at('读值', sheet, oSheet, row, column);
        oVal && values.push(oVal);
    }
    return values.length ? values : '';                                             // 空行时返回的是空串
});

