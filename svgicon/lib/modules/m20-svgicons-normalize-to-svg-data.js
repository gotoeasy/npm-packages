const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const os = require('@gotoeasy/os');
const fs = require('fs');
const SVGIcons2SVGFont = require("svgicons2svgfont");

module.exports = bus.on('svgicons-normalize-to-svg-data', function(nStart=0xA000){

    const opts = {name: 'svgfont', fontHeight: 1000, normalize: true, log: x=>x};

	return (...fileOrPaths) => {

        // 筛选出svg图标文件
        let svficonfiles = [];
        let svffiles = [];
        for ( let i=0,fileOrPath; fileOrPath=fileOrPaths[i++]; ) {
            if ( !File.exists(fileOrPath) ) continue;

            if ( File.isDirectory(fileOrPath) ) {
                svffiles.push(...File.files(fileOrPath, '**.svg'));
            }else{
                /[^\/\\]+\.svg$/i.test(fileOrPath) && svffiles.push(File.resolve('', fileOrPath));
            }
        }

        for ( let i=0,svffile,xml,states,filehashcode; svffile=svffiles[i++]; ) {
            states = fs.statSync(svffile);
            if ( states.size > 1024*3 ) continue;                           // 忽略大于3K的图标文件

            xml = File.read(svffile);
            filehashcode = hash(xml);
            if ( bus.at('cache-file', filehashcode) ) continue;             // 忽略已处理文件

            if ( !/<path\s+[\s\S]*d\s?=\s?".+".*\/>/.test(xml) ) continue;  // 忽略没有path标签没有d属性的文件

            svficonfiles.push(svffile);
            bus.at('cache-file', filehashcode, 1);                          // 标记为已处理
        }


        let fnResolve, fnReject;
        let promise = new Promise((resolve, reject) => {
            fnResolve = resolve;
            fnReject = reject;
        });

        bus.at('svgicons2svgfont-normalize1000', ...svficonfiles).then(svgfontxml => {
            svgfontxml.replace(/<glyph\s+glyph-name="(.*?)"[\s\S]*?d="(.*?)"[\s\S]*?\/>/g, function(glyph, filehashcode, d){
                if ( d ) {
                    let rs = bus.at('cache-svg-data', filehashcode);
                    if ( rs ) {
                        rs.d = d;
                        rs.unicode = (0xE000 + hash(d, true) % (0xFFFF-0xE000)).toString(16);  // 提取文件内容中glyph标签的d属性值，按d计算缓存用unicode
                    }
                }else{
                    let cache = bus.at('cache-svg-data');
                    cache.remove(filehashcode);             // d属性没有内容，删除该缓存
                }
            });

            fnResolve( bus.at('cache-svg-data') );
        }).catch(err => {
            fnReject(err);
        });

        return promise;
	};

}());
