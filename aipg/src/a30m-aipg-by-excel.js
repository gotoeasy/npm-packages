const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');

bus.on('自动编程', function (){

    return function(file){
        let plugins = bus.on('编程插件');
        let context = postobject(plugins).process({file});
        return context;
    }

}());
