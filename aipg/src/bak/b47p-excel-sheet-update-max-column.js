const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 修正Sheet的【最大列】范围，以表头最大宽度为准
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet; oSheet=context.Sheets[i++];  ){
            oSheet.maxHeadColumn && (oSheet.maxColumn = oSheet.maxHeadColumn)
        }

    });

}());
