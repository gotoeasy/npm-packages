const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 读取全部Sheet名、是否隐藏等基本信息
    return postobject.plugin(/**/__filename/**/, function(root, context){

        let Sheets = [];
        for (let i=0,sheet,name,hidden; sheet=context.workbook.sheet(i++); ){
            name = sheet.name();
            hidden = sheet.hidden();
            Sheets.push({name, hidden});
        }
        context.Sheets = Sheets;
    });

}());

