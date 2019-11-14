const bus = require('@gotoeasy/bus');


bus.on('读章节文本', function(){

    // oPos: {row, column}
    return function (sheet, oSheet, oPos){

        let oValue, rows = [];
        let startRow = oPos.row, endRow = oPos.row, startColumn = oPos.column;

        for (let row=startRow,max=startRow+30,cells; row<max; row++) {
            cells = [];
            for (let column=oPos.column; column<=oSheet.maxColumn; column++) {
                oValue = bus.at('读值', sheet, oSheet, row, column);
                oValue && cells.push(oValue);
            }

            if ( !cells.length ){
                endRow++;
                break;
            }
            rows.push(cells);
        }

        return {startRow, endRow, startColumn, rows};
    }



}());
