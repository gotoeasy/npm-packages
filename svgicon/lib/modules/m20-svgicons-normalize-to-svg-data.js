const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const fs = require('fs');

module.exports = bus.on('svgicons-normalize-to-svg-data', function(){

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
                let cache = bus.at('cache-svg-data');
                if ( d ) {
                    let rs = cache.get(filehashcode);
                    if ( rs ) {
                        let ihash = hash(d, true);
                        rs.id = ihash.toString(36);                 // 按d属性重新计算id
                        rs.d = d;
                        rs.unicode = (0xE000 + ihash % (0xFFFF-0xE000)).toString(16);  // 提取文件内容中glyph标签的d属性值，按d计算unicode，最终字体数量通常几十个，冲突可能性极小极小

                        cache.put(rs.id, Object.assign({}, rs));    // 重新按d属性计算id存入缓存,keywords复制引用 （缓存对象属性：id、d、unicode、keywords）
                    }
                }
                cache.remove(filehashcode);                         // 原缓存key是根据输入文件计算，已存放最新对象，删除旧对象
            });

            fnResolve( bus.at('cache-svg-data') );
        }).catch(err => {
            fnReject(err);
        });

        return promise;
	};

}());
