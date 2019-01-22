const os = require('@gotoeasy/os');
const hash = require('@gotoeasy/hash');
const flatCache = require('flat-cache');

// 命名缓存，存盘
const map = new Map();

// 默认缓存，不存盘
const defaultCache = flatCache.load('default');
defaultCache.put = (key, value) => defaultCache.setKey(key, value);
defaultCache.remove = key => defaultCache.removeKey(key);
defaultCache.get = (key, defaultValue) => {
    let value = defaultCache.getKey(key);
    return value !== undefined ? value : defaultValue;
};
defaultCache.save = () => {};

process.on('exit', e => {
    map.forEach(cache => cache.save(true))
})

function load(name, disableDiskCache) {
    if ( name == null ) {
        return defaultCache;
    }

    disableDiskCache && (name = hash(name));

    if ( map.has(name) ) {
        return map.get(name);
    }

    let oCache = flatCache.load(name, os.homedir() + '/.gotoeasy/.cache');
    oCache.disableDiskCache = disableDiskCache;
    oCache.put = (key, value) => oCache.setKey(key, value);
    oCache.remove = key => oCache.removeKey(key);
    oCache.get = (key, defaultValue) => {
        let value = oCache.getKey(key);
        return value !== undefined ? value : defaultValue;
    };
    oCache.fnSave = oCache.save;
    oCache.save = yes => !disableDiskCache && oCache.fnSave(yes);

    map.set(name, oCache);
    return oCache;
}

function put(key, value) {
    defaultCache.put(key, value);
}

function get(key, defaultValue) {
    return defaultCache.get(key, defaultValue);
}

function remove(key) {
    defaultCache.remove(key);
}

module.exports = {put: put, get: get, remove: remove, load};

