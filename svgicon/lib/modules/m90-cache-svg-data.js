// ---------------------------------------------
// svg缓存数据
// ---------------------------------------------
const bus = require('@gotoeasy/bus');

module.exports = bus.on('cache-svg-data', function(cache={}){

    // TODO 用fast-json-stringify提升性能
	return (hashcode, objVal) => {
        if ( hashcode === undefined ) {
            return cache;
        }
        
        if ( objVal === undefined ) {
            return cache[hashcode];
        }

        return cache[hashcode] = objVal;
	};

}());
