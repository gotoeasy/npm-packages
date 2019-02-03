const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const cache = require('@gotoeasy/cache');

module.exports = bus.on('缓存', function(caches=new Set()){

    let version = JSON.parse(File.read(File.resolve(__dirname, '../../../package.json'))).version;
    
    bus.on('缓存序列化', function(){

        return function(){
            caches.forEach(c => c.save(true)); 
        };

    }());


    return name => {
        let env = bus.at('编译环境');
        let disableDiskCache = !!env.disableDiskCache;
        let path = env.path.root + '/.cache';

        let oCache = cache.load(version + '_' + name, {path, disableDiskCache});
        caches.add(oCache);
        return oCache;
    }

}());
