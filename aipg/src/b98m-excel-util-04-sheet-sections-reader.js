const bus = require('@gotoeasy/bus');


bus.on('读取章节', function (sheet, oSheet){
    let contents = bus.at('顺序通读', sheet, oSheet);
console.info( )
console.info( JSON.stringify(contents,null,2))
console.info( ) 
    return bus.at('整理章节', sheet, oSheet, contents);
});

bus.on('整理章节', function (sheet, oSheet, contents){

    let oRoot = {};
    for (let i=0; i<contents.length; i++) {
        i = bus.at('整理子章节', oRoot, contents, i);
    }
    return oRoot;
});


bus.on('整理子章节', function (oParent, contents, index){

    !oParent.nodes && (oParent.nodes = []);

    let oItem, oSec;
    for (let i=index; i<contents.length; i++) {
        oItem = contents[i];
        if ( !oItem ) {
            continue;
        }

        oSec = {...oItem};
        oSec.Seq = bus.at('章节编号', oItem.values[0]);

        // 找到父章节，并添加为父章节的子章节
        let oSuper = oParent;
        let iColSec, iColParent;
        while (oSuper) {

            if ( !oSuper.parent ) {
                oSec.parent = ()=>oSuper;
                oSuper.nodes.push(oSec);                                                                // 根节点了，直接添加为子章节
                break;
            }

            if ( oSec.Seq && oSuper.Seq ) {
                if ( oSec.Seq.seq > oSuper.Seq.seq ) {
                    oSec.parent = ()=>oSuper;
                    oSuper.nodes.push(oSec);                                                            // 都有章节号时，按章节号比较是否为子章节
                    break;
                }
            }else{
                iColSec = oSec.startColumn || bus.at('地址起始列数字', oSec.values[0].cell);
                iColParent = oSuper.startColumn || bus.at('地址起始列数字', oSuper.values[0].cell);
                if ( iColSec > iColParent ) {
                    oSec.parent = ()=>oSuper;
                    oSuper.nodes.push(oSec);                                                            // 没有章节号时，按缩进对齐方式判断是否子章节（比较首个单元格位置）
                    break;
                }
            }
            oSuper = oSuper.parent();
        }

        return bus.at('整理子章节', oSec, contents, i+1);                                                  // 继续按顺序整理
    }

});

bus.on('顺序通读', function (sheet, oSheet){

    let iStartColumn, aryVal, contents = [];

    for (let row=oSheet.maxHeadRow+1; row<=oSheet.maxRow; row++ ) {

        iStartColumn = bus.at('边框表格首行开始列', sheet, row);
        if ( iStartColumn ) {
            aryVal = bus.at('读边框表格', sheet, oSheet, row, iStartColumn);                            // 表格对象
            row = aryVal.endRow - 1;                                                                    // 表格末行
        }else{
            aryVal = bus.at('读行单元格', sheet, oSheet, row);                                          // 返回数组
        }

        contents.push(aryVal);
    }

    let rs = [];
    for (let i=0,aryLine; aryLine=contents[i++]; ) {
        if ( aryLine.length === 1 && aryLine[0].delete ) continue;                                      // 过滤删除行

        if ( aryLine.length ) {
            rs.push(aryLine);
        }else{
            rs[rs.length-1] && rs[rs.length-1].length && rs.push(aryLine);                              // 重复空行仅保留一行
        }
    }

    rs = bus.at('同段文本合并', rs);
    // TODO 表格的头部脚部文本，表头识别
    return rs;
});

bus.on('同段文本合并', function (contents){

    if ( !contents.length ) return [];

    let rs = [], oSec, values;
    for (let i=0; i<contents.length; i++) {
        values = contents[i];
        if ( values.length ) {
            if ( values.endRow ) {
                rs.push({table: values.trs, endRow:values.endRow, startColumn:values.startColumn});     // 表格
                oSec = null;
            }else{
                if ( !oSec ) {
                    rs.push(oSec = {values});                                                           // 起始文本章节
                }else{
                    if ( bus.at('章节编号', values[0]) ) {
                        rs.push(oSec = {values});                                                       // 有章节编号，按新章节处理
                    }else{
                        oSec.values.push(...values);                                                    // 没有章节编号的做合并处理
                    }
                }
            }
        }else{
            rs.push(oSec = null);                                                                       // 空行
        }
    }

    return rs;
});

bus.on('读边框表格', function (sheet, oSheet, iStartRow, iStartColumn){

    let trs = bus.at('边框表格全部行位置', sheet, oSheet, iStartRow, oSheet.maxRow, iStartColumn, oSheet.maxColumn);
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
    trs = trs.filter(tr => !tr);                                                                        // 过滤删除行

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

bus.on('章节编号', function (oVal){

    if ( !oVal || !oVal.value ) return null;

    let str = (oVal.value + '').trim();
    let match = str.match(/^[0-9１２３４５６７８９０一二三四五六七八九〇ⅠⅡⅢⅣⅤⅥⅦⅧⅨ㈠㈡㈢㈣㈤㈥㈦㈧㈨⒈⒉⒊⒋⒌⒍⒎⒏⒐Ⅺ⒑㈩⑽]+[0-9１２３４５６７８９０一二三四五六七八九〇ⅠⅡⅢⅣⅤⅥⅦⅧⅨ㈠㈡㈢㈣㈤㈥㈦㈧㈨⒈⒉⒊⒋⒌⒍⒎⒏⒐Ⅺ⒑㈩⑽.．－-]*/);
    if ( !match ) return null;

    let oNum = {
        '１': '1',  '一': '1',  'Ⅰ': '1',   '⑴': '1',   '㈠': '1',   '⒈': '1',
        '２': '2',  '二': '2',  'Ⅱ': '2',   '⑵': '2',   '㈡': '2',   '⒉': '2',
        '３': '3',  '三': '3',  'Ⅲ': '3',  '⑶': '3',   '㈢': '3',   '⒊': '3',
        '４': '4',  '四': '4',  'Ⅴ': '4',  '⑷': '4',   '㈣': '4',   '⒋': '4',
        '５': '5',  '五': '5',  'Ⅵ': '5',  '⑸': '5',   '㈤': '5',   '⒌': '5',
        '６': '6',  '六': '6',  'Ⅶ': '6',  '⑹': '6',   '㈥': '6',   '⒍': '6',
        '７': '7',  '七': '7',  'Ⅷ': '7',  '⑺': '7',  '㈦': '7',  '⒎': '7',
        '８': '8',  '八': '8',  'Ⅸ': '8',  '⑻': '8',   '㈧': '8',   '⒏': '8',
        '９': '9',  '九': '9',  'Ⅹ': '9',   '⑼': '9',  '㈨': '9',  '⒐': '9',
        '０': '0',  '〇': '0',
        'Ⅺ': '10',  '⒑': '10',  '㈩': '10',  '⑽': '10',
    };

    let strMatch = match[0].split('').map(ch => oNum[ch] ? oNum[ch] : ch).join('');                     // 数字统一替换为半角数字
    strMatch = strMatch.replace(/[.．－]+/g, '-');                                                      // 分隔符统一替换为半角减号

    let ary = strMatch.split('-');
    ary = ary.map( v => ((100+(v-0))+'').substring(1) );                                                // 每段统一2位长度
    while (ary.length < 5) ary.push('00');                                                              // 统一为5段，便于字符串方式比较
    let seq = ary.join('-');
    let cell = oVal.cell;

    return {cell, seq, orig:match[0]};
});
