// -----------------------------------------------------------------------------
// 单元格读值，不是件单纯的事
// 参数可以是（行、列）或（名称地址）或（地址对象）
// 
// 1，数字带日期格式的单元格 ........ 所见即所得，只应付常见格式
// 2，数字带逗号格式的单元格 ........ 直接返回原数字（转字符串）
// 3，公式单元格 .................. 所见即所得
// 4，富文本单元格带部分删除线 ...... 人性化读取，要去除删除线文字
// 5，富文本单元格带全部删除线 ...... 人性化读取，返回半角空格以区别无内容
// 6，无内容的null单元格 ........... 人性化读取，返回无内容的空串
// 7，单元格格式 .................. numberFormat和background，有则读出备用
// -----------------------------------------------------------------------------
bus.on('读值', function(){

    return function (sheet, oSheet, iRow, iColumn){

        if ( !iRow ) return {value: ''};                                            // 参数输入无效时的返回值

        let oAddr;
        if ( typeof iRow === "string" ) {
            oAddr = bus.at('地址转换', iRow);                                       // {cell, addr, startRow, endRow, startColumn, endColumn}
        }else if ( typeof iRow === "number" ) {
            if ( !iColumn ) {
                return {value: ''};                                                 // 参数输入无效时的返回值
            }else{
                oAddr = bus.at('地址转换', bus.at('数字转列名', iColumn) + iRow);
            }
        }else{
            oAddr = iRow;                                                           // 传入的就是地址对象
        }

        return readCell(sheet, oAddr);                                              // 对象或数组或空串
    }


    // 返回对象
    function readCell(sheet, oAddr){

        let {cell} = oAddr;                                                         // cell:单元格地址
        let oCell = sheet.cell(cell);
        let value = oCell.value();

        let del = false;
        let numberFormat = null;
        let fill = null;

        if ( value == null ) {
            // 转成空串直接返回
            value = '';
        }else if ( value.get ) {
            // 富文本时，检查忽略带删除线的文字
            let txt = '';
            for (let i=0,fragment,val; fragment=value.get(i++); ) {
                val = fragment.value();
                if ( val != null ) {
                    if ( fragment.style('strikethrough') ) {
                        del = true;                                                 // 有删除内容
                    }else{
                        txt += val;
                    }
                }
            }
            value = txt;
        }else{
           numberFormat = oCell.style('numberFormat');
           fill = oCell.style('fill');  // background
           value = value + '';
        }

        let rs = {cell, value};
        !value && del && (rs.delete = true);
        numberFormat && numberFormat !== 'General' && (rs.numberFormat = numberFormat);
        fill && (rs.fill = fill);

        return rs;
    }

}());
