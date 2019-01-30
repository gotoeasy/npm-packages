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

    if ( addfavorites || removefavorites || list || favorites ) {

        if ( addfavorites ) {
            let param = getQueryParam(oUrl.query);
            addFavorites( param.id );           // 地址格式 /addfavorites?id=_j2c084
            res.end(JSON.stringify({}));
            console.log('add favorites:', bus.at('cache-svg-data', param.id).keywords[0]);
        }else if ( removefavorites ) {
            let param = getQueryParam(oUrl.query);
            removeFavorites ( param.id );     // 地址格式 /removefavorites?_j2c084
            res.end(JSON.stringify({}));
            console.log('remove favorites:', bus.at('cache-svg-data', param.id).keywords[0]);
        }else if ( list ) {
            let cache = bus.at('cache-svg-data');
            let keys = cache.keys();
            let rs = [];
            keys.forEach(k => rs.push(cache.get(k)));
            res.end( JSON.stringify(rs) )
            console.log('query all icons', keys.length);
        }else if ( favorites ) {
            let cache = bus.at('cache-favorites');
            let keys = cache.keys();
            let rs = [];
            keys.forEach(k => rs.push(cache.get(k)));
            res.end( JSON.stringify(rs) )
            console.log('query favorites icons', keys.length);
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

