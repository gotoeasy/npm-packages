const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 根据Sheet名称识别Sheet类型（修订履历、页面布局、页面项目、详细处理、编辑、补足、、、、等等）
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet,sheet; oSheet=context.Sheets[i++];  ){
            if ( oSheet.ignore ) continue;                          // 跳过忽略的Sheet

            sheet = context.workbook.sheet(oSheet.name);
            oSheet.mapMergeCell = getMapMergeCell(sheet);           // 所有合并单元格的地址信息，如 {'A1': {addr: 'A1:C2', startRow:1, endRow:2, startColumn:1, endColumn:3}}
        }
    });

}());

function getMapMergeCell(sheet){
    let map = new Map();
    let oMergeCells = sheet._mergeCells;
    for (let addr in oMergeCells) {
        map.set(addr.split(':')[0], bus.at('地址转换', addr));      // 首单元格作为键，值为地址信息对象
    }
    return map;
}