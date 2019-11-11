const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 过滤掉要忽略的Sheet（删除的，隐藏的，等等），添加忽略标记
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet; oSheet=context.Sheets[i++];  ){
            if ( oSheet.hidden          // 隐藏的Sheet
                 || /^\s*[×✖]/.test(oSheet.name) // Sheet名称用删除符号注明删除
                 || /^\s*([【（<＜《(]×[】）＞>》)]|[【（<＜《(]✖[】）＞>》)])/i.test(oSheet.name) // 括号内删除符号注明删除
                 || /^\s*([【（<＜《(]删除[】）＞>》)]|[【（<＜《(]废弃[】）＞>》)]|[【（<＜《(]忽略[】）＞>》)]|[【（<＜《(]无视[】）＞>》)])/i.test(oSheet.name) // 文字注明删除
                 || /^\s*([【（<＜《(]削除[】）＞>》)]|[【（<＜《(]廃棄[】）＞>》)]|[【（<＜《(]廃止[】）＞>》)]|[【（<＜《(]無視[】）＞>》)])/i.test(oSheet.name)
                 || /^\s*([【（<＜《(]delete[】）＞>》)]|[【（<＜《(]ignore[】）＞>》)]|[【（<＜《(]ignored[】）＞>》)])/i.test(oSheet.name)
                 || /^\s*$/.test(oSheet.name) // Sheet名称空白
                ) {
                oSheet.ignore = true;
            }else{
                oSheet.ignore = false;
            }
        }
    });

}());

