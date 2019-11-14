const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');

bus.on('全部编写', function (){

    return async function(){

        let env = bus.at("环境");
        let plugins = bus.on('编程插件'); // 用bus.on而不是bus.at
        let context = await postobject(plugins).process({file: env.file});
        return context;
    }

}());
