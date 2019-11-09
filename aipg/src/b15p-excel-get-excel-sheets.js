const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 读取Excel文档属性，存放至context.documentProperties备用
    return postobject.plugin(/**/__filename/**/, function(root, context){

        let Sheets = [];
        for (let i=0,sheet,name,type='Sheet'; sheet=context.workbook.sheet(i++); ){
            name = sheet.name();
            Sheets.push({type, name});
        }
        context.Sheets = Sheets;

        console.log(Sheets)
    });

}());

