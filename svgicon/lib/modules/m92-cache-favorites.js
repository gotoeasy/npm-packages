// ---------------------------------------------
// 文件读取标记缓存
// ---------------------------------------------
const bus = require('@gotoeasy/bus');

module.exports = bus.on('cache-favorites', function(){

    let cache = require('@gotoeasy/cache').load('svgicon-cache-favorites');

	return (hashcode, isFavorite) => {
        if ( hashcode === undefined ) {
            return cache;
        }
        
        if ( isFavorite === undefined ) {
            return cache.get(hashcode);
        }

        isFavorite ? cache.put(hashcode, true) : cache.remove(hashcode);
	};

}());
