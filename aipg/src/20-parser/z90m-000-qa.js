bus.on('QA', function(cnt=0){
    
    return function(obj){
    
        console.info(`[QA] ${++cnt}`, JSON.stringify(obj, null, 2));

    }

}());

