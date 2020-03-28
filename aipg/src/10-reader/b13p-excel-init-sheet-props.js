bus.on('阅读器插件', function(){
    
    // 过滤掉要忽略的Sheet（删除的，隐藏的，等等），添加忽略标记
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet; oSheet=context.Sheets[i++];  ){
            oSheet.ignore = !!(oSheet.hidden || bus.at('是否忽略Sheet', oSheet.name));
            oSheet.type = bus.at('Sheet类型', oSheet.name);
        }
    });

}());

