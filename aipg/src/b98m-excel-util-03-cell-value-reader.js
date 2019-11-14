const bus = require('@gotoeasy/bus');

// -----------------------------------------------------------------------------
// 单元格读值，不是件单纯的事
// 参数可以是（行、列）或（名称地址）或（地址对象）
// 
// 1，数字或日期等格式化的单元格 ....... 所见即所得
// 2，公式单元格 ....................... 所见即所得
// 3，富文本单元格 ..................... 人性化读取，要去除删除线文字
// 4，合并单元格 ....................... 人性化读取，合并范围内仅读合并单元格
// 5，线框单元格 ....................... 人性化读取，线框范围内多单元格合并读取
// -----------------------------------------------------------------------------
bus.on('读值', function(){

    return function (sheet, oSheet, iRow, iColumn){

        if ( !iRow ) return '';

        let oAddr;
        if ( typeof iRow === "string" ) {
            oAddr = bus.at('地址转换', iRow);                                       // {cell, addr, startRow, endRow, startColumn, endColumn}
        }else if ( typeof iRow === "number" ) {
            if ( !iColumn ) {
                return '';
            }else{
                oAddr = bus.at('地址转换', bus.at('数字转列名', iColumn) + iRow);
            }
        }else{
            oAddr = iRow;                                                           // 传入的就是地址对象
        }

        return readCell(sheet, oAddr, oSheet.mapMergeCell.has(oAddr.cell));         // 对象或数组或空串
    }


    // 返回对象或数组或null
    function readCell(sheet, oAddr, isMerged){

        //let {cell, addr, startRow, endRow, startColumn, endColumn} = oAddr;         // cell:单元格地址
        let {cell} = oAddr;                                                         // cell:单元格地址
        let oCell = sheet.cell(cell);
        let value = oCell.value();

        if ( value == null ) {
            // 转成空串直接返回
            return '';
        }else if ( value.get ) {
            // 富文本时，检查忽略带删除线的文字
            let txt = '';
            for (let i=0,fragment; fragment=value.get(i++); ) {
                !fragment.style('strikethrough') && (txt += fragment.value());
            }
            value = txt;
        }else{
            // TODO
           // let fmt = oCell.style('numberFormat');
           //   fmt = oCell.style('fill');  // background
           // fmt && (value += fmt)
        }

        

        if ( value == null ) {
            return '';
        }

        if ( isMerged ) {
            return {cell, value};
        }
        
        return {cell, value};
    }

}());
