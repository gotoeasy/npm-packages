const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const os = require('@gotoeasy/os');
const fs = require('fs');
const SVGIcons2SVGFont = require("svgicons2svgfont");

// TODO 解决unicode冲突
module.exports = bus.on('svgicons-normalize-to-svg-data', function(){

    const opts = {name: 'svgfont', fontHeight: 1000, normalize: true, log: x=>x};

	return (...files) => {

        let fnResolve, fnReject;
        let promise = new Promise((resolve, reject) => {
            fnResolve = resolve;
            fnReject = reject;
        });

        bus.at('svgicons2svgfont-normalize1000', ...files).then(svgfontxml => {
            svgfontxml.replace(/<glyph\s+glyph-name="(.*?)"[\s\S]*?d="(.*?)"[\s\S]*?\/>/g, function(glyph, filehashcode, d){
                if ( d ) {
                    let rs = bus.at('cache-svg-data', filehashcode);
                    rs && (rs.d = d) && (rs.unicode = (0xEA00 + hash(d, true) % (0xEFFF-0xEA00)).toString(16) );   // 提取文件内容中glyph标签的d属性值，按d计算unicode
                }else{
                    let rs = bus.at('cache-svg-data');
                    delete rs[filehashcode];
                }
            });

            fnResolve( bus.at('cache-svg-data') );
        });

        return promise;
	};

}());
