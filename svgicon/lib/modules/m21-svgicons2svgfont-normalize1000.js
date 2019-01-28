// ---------------------------------------------
// 读取svg图标文件，转换统一大小，存放缓存并序列化
// ---------------------------------------------
const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const os = require('@gotoeasy/os');
const fs = require('fs');
const SVGIcons2SVGFont = require("svgicons2svgfont");

module.exports = bus.on('svgicons2svgfont-normalize1000', function(){

    const opts = {name: 'svgfont', fontHeight: 1000, normalize: true, log: x=>x};

	return (...files) => {

        return new Promise((resolve, reject) => {
            let fontStream = new SVGIcons2SVGFont(opts);
            let fileTmpSvgfont = os.homedir() + '/temp_' + new Date().getTime() + '.svg';
            fontStream.pipe(fs.createWriteStream(fileTmpSvgfont))
                .on("finish", () => {
                    let txt = File.read(fileTmpSvgfont);
                    File.remove(fileTmpSvgfont);
                    resolve(txt);
                }).on("error", (err) => {
                    File.remove(fileTmpSvgfont);
                    reject(err);
                });

            // 读取目录，文件去重复
            let fileSet = new Set();
            files.forEach( file => fileSet.add(file) );

            // 读取合并
            fileSet.forEach(file => {
                let glyph = bus.at('svgicons2svgfont-normalize1000-glyph', file);
                glyph && fontStream.write( glyph );
            });

            fontStream.end();
        });

	};

}());
