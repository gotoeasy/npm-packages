const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 读取Excel文档
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        // 打开Excel文档，往后使用context.workbook读取Excel内容，读取完后再删除
        let XlsxPopulate = require('xlsx-populate');
        context.workbook = await XlsxPopulate.fromFileAsync(context.input.file);

    });

}());

