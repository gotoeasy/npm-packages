// ---------------------------------------------
// 读取svg图标文件，转换统一大小，存放缓存并序列化
// ---------------------------------------------
const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const path = require('path');
const fs = require('fs');

// svg转glyph，如果是已转换过的svg则仅添加文件名关键字返回undefined
module.exports = bus.on('svgicons2svgfont-normalize1000-glyph', function(nStart=0xA000){

    return (file) => {

        if ( !/\.svg$/i.test(file) || !File.exists(file) ) return;          // 仅简单检查，调用需注意文件正常
    
        let basename = path.basename(file, ".svg").toLowerCase();           // 文件名（不含路径不含扩展名，通常作为检索关键字）
        
        basename.indexOf('#') > 1 && (basename = basename.substring(basename.indexOf('#')+1));
        basename = basename.replace(/[^a-z\d\-_]{1}/g, '-'); // TODO 非规约文件名

        let filehashcode = '_' + hash({file});
        let data = bus.at('cache-svg-data', filehashcode);
        if ( data ) {
            let ary = data.keywords || [];
            !ary.includes(basename) && ary.push(basename);                  // 缓存中已存在时，仅检查添加文件名作为检索关键字
            return;
        }

        // 存缓存
        let keywords = [basename];
        bus.at('cache-svg-data', filehashcode, {filehashcode, keywords});   // name为unicode编码，如【e001】；图标内容d另做

        // 创建glyph
        let unicode = [String.fromCharCode(nStart++)];
        let glyph = fs.createReadStream(file);
        glyph.metadata = {unicode, name: filehashcode};                     // 通过filehashcode关联图标
        return glyph;
    };

}());
