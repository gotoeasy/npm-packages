const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');

bus.on('自动编程', function (){

    return async function(file){
        let plugins = bus.on('编程插件'); // 用bus.on而不是bus.at
        let context = await postobject(plugins).process({file});
        return context;
    }

}());
