const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 删除workbook对象
    return postobject.plugin(/**/__filename/**/, function(root, context){
        delete context.workbook;
    });

}());

