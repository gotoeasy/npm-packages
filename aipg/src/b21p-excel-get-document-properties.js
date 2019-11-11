const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 读取Excel文档属性，存放至context.documentProperties备用
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        let xlsxProperties = require('office-document-properties');
        let promiseProperties = new Promise(resolve => {
            xlsxProperties.fromFilePath(context.input.file, (err, data) => {
                resolve(err ? {} : data);   // 出错时空内容对象
            });
        });

        context.documentProperties = await promiseProperties;
    });

}());

