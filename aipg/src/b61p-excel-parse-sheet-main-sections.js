const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 解析Sheet的【章节】
    return postobject.plugin(/**/__filename/**/, function(root, context){

        let sestions = [];
        let oSheet,sheet,startRow,endRow,startColumn,endColumn,oCell,isTableCell;
        for (let i=0; oSheet=context.Sheets[i++]; ){
            if ( oSheet.ignore ) continue;                                                  // 跳过忽略的Sheet

            sheet = context.workbook.sheet(oSheet.name);
            startRow = oSheet.maxHeadRow + 1;                                               // 开始行
            endRow = oSheet.maxRow;                                                         // 结束行
            startColumn = 1;                                                                // 开始列
            endColumn = oSheet.maxHeadColumn;                                               // 结束列

            oCell = getSestionStartRow(sheet, startRow, endRow, startColumn, endColumn);    // 主章节起始单元格
            isTableCell = isCellInTable(sheet, oSheet, oCell);                              // 是不是表格中的单元格
            if ( isTableCell ) {
                let oTableRange = getTableRange(sheet, oSheet, oCell);                      // 表格的起始单元格
                sestions.push(oTableRange);                                                 // TODO
            }else{
                let aryCells = parseSestionText(sheet, oSheet, oCell);                      // 章节文本
                sestions.push(aryCells);
            }

            oSheet.Sestions = sestions;
        }

    });

}());

// 读取文本章节
function parseSestionText(sheet, oSheet, oCell){
    let value, rs = [];
    for (let row=oCell.row,max=oCell.row+30,cells; row<max; row++) {
        cells = [];
        for (let column=oCell.column; column<=oSheet.maxHeadColumn; column++) {
            value = sheet.row(row).cell(column).value();
            bus.at('isNotBlank', value) && cells.push({row, column, value});
        }

        if ( !cells.length ) break;
        rs.push(...cells);
    }
    return rs;
}

// 在指定的表格行中，找出表格的起始行列范围
function getTableRange(sheet, oSheet, oCell){

    let startRow = oCell.row, endRow, startColumn, endColumn;

    // 第一个看起来有左边框的单元格，就是开始列
    for (let column=2; column<oSheet.maxHeadColumn; column++ ) {
        if ( sheet.row(startRow).cell(column).style('border').left || sheet.row(startRow).cell(column-1).style('border').right) {
            startColumn = column;
            break;
        }
    }
    // 最后一个看起来有右边框的单元格，就是结束列
    for (let column=oSheet.maxHeadColumn-1; column>1; column-- ) {
        if ( sheet.row(startRow).cell(column).style('border').right || sheet.row(startRow).cell(column+1).style('border').left) {
            endColumn = column;
            break;
        }
    }
    // 最后一个看起来有底线的单元格，所在就是结束行
    for (let row=startRow; row<oSheet.maxRow; row++ ) {
        if ( sheet.row(row).cell(startColumn).style('border').bottom || sheet.row(row).cell(startColumn+1).style('border').top) {
            endRow = row;
            break;
        }
    }

    return {startRow, endRow, startColumn, endColumn};
}

// 判断指定单元是否在表格中（当前行有竖线）
function isCellInTable(sheet, oSheet, oCell){

    // 通常起始单元格有左边框
    if ( sheet.row(oCell.row).cell(oCell.column).style('border').left ) {
        return true;
    }

    // 除去Sheet页左右边框线外，发现竖向边框就算是
    for (let i=1; i<oSheet.maxHeadColumn; i++ ) {
        if ( sheet.row(oCell.row).cell(oCell.column).style('border').right ) {
            return true;
        }
    }

    return false;
}

// 在指定范围内找出非空白的起始单元格
function getSestionStartRow(sheet, iStartRow, iEndRow, iStartColumn, iEndColumn){

    for (let row=iStartRow,value; row<iEndRow; row++) {
        for (let column=iStartColumn; column<=iEndColumn; column++) {
            value = sheet.row(row).cell(column).value();
            if ( bus.at('isNotBlank', value) ) {
                return {row, column};
            }
        }
    }
    return null; // 找不到返回null
}
