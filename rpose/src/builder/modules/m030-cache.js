const bus = require('@gotoeasy/bus');
const cache = require('@gotoeasy/cache');

module.exports = bus.on('缓存', function(caches=new Set()){

    bus.on('缓存序列化', function(){

        return function(){
            caches.forEach(c => c.save(true)); 
        };

    }());


    return name => {
        let env = bus.at('编译环境');
        let oCache = cache.load(name, !!env.disableDiskCache);
        caches.add(oCache);
        return oCache;
    }

}());
