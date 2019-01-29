// ---------------------------------------------
// 文件读取标记缓存
// ---------------------------------------------
const bus = require('@gotoeasy/bus');

module.exports = bus.on('cache-file', function(){

    let cache = require('@gotoeasy/cache').load('svgicon-cache-file');

	return (hashcode, isRead) => {
        if ( hashcode === undefined ) {
            return cache;
        }
        
        if ( isRead === undefined ) {
            return cache.get(hashcode);
        }

        isRead ? cache.put(hashcode, true) : cache.remove(hashcode);
	};

}());
