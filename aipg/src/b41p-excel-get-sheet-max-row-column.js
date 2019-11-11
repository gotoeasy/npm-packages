const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 读取Sheet的最大行数列数备用
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet,usedRange; oSheet=context.Sheets[i++];  ){
            if ( oSheet.ignore ) continue;                                      // 跳过忽略的Sheet

            usedRange = context.workbook.sheet(oSheet.name).usedRange();
            if (usedRange) {
                oSheet.maxColumn = usedRange._maxColumnNumber;
                oSheet.maxRow = usedRange._maxRowNumber;
            }else{
                oSheet.maxColumn = 0;
                oSheet.maxRow = 0;
            }
        }
    });

}());

