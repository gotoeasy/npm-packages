const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 解析Sheet的【章节】
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet; oSheet=context.Sheets[i++]; ){
            if ( oSheet.ignore ) continue;                                                              // 跳过忽略的Sheet

            let sestions = oSheet.Sestions = [];                                                        // 章节数组先存起来

            let sheet = context.workbook.sheet(oSheet.name);
            let startRow = oSheet.maxHeadRow + 1;                                                       // 开始行
            let endRow = oSheet.maxRow;                                                                 // 结束行
            let startColumn = 1;                                                                        // 开始列
            let endColumn = oSheet.maxColumn;                                                           // 结束列

            // 主章节起始单元格
            let oPos = bus.at('非空白起始单元格', sheet, startRow, endRow, startColumn, endColumn);     // 位置对象 {row, column}
            if ( !oPos ) continue;                                                                      // 没内容哦

            let oTbPos = bus.at('边框表格位置', sheet, oSheet, oPos.row, oPos.column);                  // 位置对象 {startRow, endRow, startColumn, endColumn}
            if ( oTbPos ) {
                // 表格
                sestions.push(oTbPos);                                                         // TODO
            }else{
                // 文字
                let section = bus.at('读章节文本', sheet, oSheet, oPos);
                sestions.push(section);
            }

        }

    });

}());

