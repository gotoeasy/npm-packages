// ---------------------------------------------
// svg缓存数据
// ---------------------------------------------
const bus = require('@gotoeasy/bus');

module.exports = bus.on('cache-svg-data', function(){

    let cache = require('@gotoeasy/cache').load('svgicon-cache-svg-data');

	return (hashcode, objVal) => {
        if ( hashcode === undefined ) {
            return cache;
        }
        
        if ( objVal === undefined ) {
            return cache.get(hashcode);
        }

        cache.put(hashcode, objVal);
	};

}());
