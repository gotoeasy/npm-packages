const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    return postobject.plugin(/**/__filename/**/, function(root, context){
        
        console.info(context.Sheets)
        
    });

}());

