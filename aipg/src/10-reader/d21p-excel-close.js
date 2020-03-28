bus.on('阅读器插件', function(){
    
    // 释放部分属性
    return postobject.plugin(/**/__filename/**/, function(root, context){

        delete context.workbook;
        // delete context.Sheets; // 测试代码中使用，删除将导致测试出错
    });

}());

