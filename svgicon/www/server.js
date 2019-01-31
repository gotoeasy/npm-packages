const http = require('http');
const url = require('url');
const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const fs = require('fs');
const opn = require('opn');

require('../lib/loadModules')();


const server = http.createServer(async (req, res) => {

    let oUrl = url.parse(req.url);
    let addfavorites = /^\/addfavorites$/i.test(oUrl.pathname);
    let removefavorites = /^\/removefavorites$/i.test(oUrl.pathname);
    let list = /^\/list$/i.test(oUrl.pathname);
    let favorites = /^\/favorites$/i.test(oUrl.pathname);
    let search = /^\/search$/i.test(oUrl.pathname);

    if ( addfavorites || removefavorites || list || favorites || search ) {

        if ( addfavorites ) {
            let param = getQueryParam(oUrl.query);
            addFavorites( param.id );           // 地址格式 /addfavorites?id=_j2c084

            let total, favorites;
            total = bus.at('cache-svg-data').keys().length;
            favorites = bus.at('cache-favorites').keys().length;
            res.end(JSON.stringify({total, favorites}));
            console.log('add favorites:', bus.at('cache-svg-data', param.id).keywords[0]);
        }else if ( removefavorites ) {
            let param = getQueryParam(oUrl.query);
            removeFavorites ( param.id );     // 地址格式 /removefavorites?_j2c084

            let total, favorites;
            total = bus.at('cache-svg-data').keys().length;
            favorites = bus.at('cache-favorites').keys().length;
            res.end(JSON.stringify({total, favorites}));
            console.log('remove favorites:', bus.at('cache-svg-data', param.id).keywords[0]);
        }else if ( list ) {
            let cache = bus.at('cache-svg-data');
            let keys = cache.keys();

            let icons=[], total, favorites;
            keys.forEach(k => icons.push(cache.get(k)));

            total = icons.length;
            favorites = bus.at('cache-favorites').keys().length;
            res.end( JSON.stringify({icons, total, favorites}) )
            console.log('query all icons', icons.length);
        }else if ( favorites ) {
            let cache = bus.at('cache-svg-data');
            let keys = bus.at('cache-favorites').keys();

            let icons=[], total, favorites;
            keys.forEach(k => {
                let icon = cache.get(k);
                if ( icon ) {
                     (icon.favorite = true) && icons.push(icon);
               }else{
                    bus.at('cache-favorites').remove(k);
                }
            });

            total = bus.at('cache-svg-data').keys().length;
            favorites = icons.length;
            res.end( JSON.stringify({icons, total, favorites}) )
            console.log('query favorites icons', icons.length);
        }else if ( search ) {
            let param = getQueryParam(oUrl.query);
            let searchkeys = param.key.toLowerCase().split('+');

            let cache = bus.at('cache-svg-data');
            let keys = cache.keys();
            let icons = [];
            keys.forEach(k => {
                let icon = cache.get(k);
                let kws = icon.keywords.join(' ');
                let match = true;
                for ( let i=0; i<searchkeys.length; i++ ) {
                    if ( kws.indexOf(searchkeys[i]) < 0 ) {
                        match = false;
                        break;
                    }
                }
                match && icons.push(icon);
            });

            let total, favorites;
            total = cache.keys().length;
            favorites = bus.at('cache-favorites').keys().length;
            res.end(JSON.stringify({total, favorites, icons}));
            console.log('search icons:', icons.length);
        }

        res.writeHead(200, {'Content-Type': 'application/json'});
        return;
    }
    
    let filepath = File.resolve(__dirname, './' + oUrl.pathname);
    !File.isFileExists(filepath) && (filepath = File.resolve(__dirname, './index.html'));
    !filepath.endsWith('favicon.ico') && console.log('response:', filepath);

    res.writeHead(200);
    fs.createReadStream(filepath).pipe(res);

});

server.listen(8765);

console.log('[Server started] http://127.0.0.1:8765/');
opn('http://127.0.0.1:8765'); // 浏览器本地打开


function getQueryParam(query){
    let param = {};
    let kvs = query.split('&');
    kvs.forEach(kv => {
        let ary = kv.split('=');
        ary.length == 2 && (param[ary[0]] = ary[1]);
    });
    return param;
}



// 添加到收藏夹
function addFavorites(key){
    let svgd = bus.at('cache-svg-data', key);
    svgd && (svgd.favorite = true);
    key && bus.at('cache-favorites', key, true) > bus.at('cache-favorites').save(true);
}

// 从收藏夹删除
function removeFavorites(key){
    let svgd = bus.at('cache-svg-data', key);
    svgd && delete svgd.favorite;
    key && bus.at('cache-favorites', key, false) > bus.at('cache-favorites').save(true);
}

