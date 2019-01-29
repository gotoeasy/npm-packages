const http = require('http');
const url = require('url');
const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const fs = require('fs');
const opn = require('opn');

require('../lib/loadModules')();


let created;

const server = http.createServer(async (req, res) => {

    let oUrl = url.parse(req.url);

    let addfavorites = /^\/addfavorites$/i.test(oUrl.pathname);
    let removefavorites = /^\/removefavorites$/i.test(oUrl.pathname);
    let list = /^\/list$/i.test(oUrl.pathname);
    let favorites = /^\/favorites$/i.test(oUrl.pathname);

    if ( addfavorites || removefavorites || list || favorites ) {

        if ( addfavorites ) {
            addFavorites ( oUrl.query );           // 地址格式 /addfavorites?_j2c084
            res.end(JSON.stringify({}));
            console.debug('add favorites:', oUrl.query);
        }else if ( removefavorites ) {
            removeFavorites ( oUrl.query );     // 地址格式 /removefavorites?_j2c084
            res.end(JSON.stringify({}));
            console.debug('remove favorites:', oUrl.query);
        }else if ( list ) {
            res.end( JSON.stringify(bus.at('cache-favorites')) )
            console.debug('query all icons');
        }else if ( favorites ) {
            res.end( JSON.stringify(bus.at('cache-favorites')) )
            console.debug('query favorites icons');
        }

        res.writeHead(200, {'Content-Type': 'application/json'});
        return;
    }
    
    !created && (created = true) && await bus.at('svg-data-to-webfonts', File.resolve(__dirname, './www'));

    res.writeHead(200);
    let filepath = File.resolve(__dirname, './www' + oUrl.pathname);
    !File.isFileExists(filepath) && (filepath = File.resolve(__dirname, './www/index.html'));
    console.debug('response:', filepath)
    fs.createReadStream(filepath).pipe(res);

});

server.listen(8765);

console.log('[Server started] http://127.0.0.1:8765/');
opn('http://127.0.0.1:8765'); // 浏览器本地打开



// 添加到收藏夹
function addFavorites(key){
    key && bus.at('cache-favorites', key, true) > bus.at('cache-favorites').save(true);
}

// 从收藏夹删除
function removeFavorites(key){
    key && bus.at('cache-favorites', key, false) > bus.at('cache-favorites').save(true);
}

