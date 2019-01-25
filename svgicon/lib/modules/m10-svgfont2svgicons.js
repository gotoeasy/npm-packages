// ---------------------------------------------
// 从svg字体文件中导出svg图标文件
// ---------------------------------------------
const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const fs = require('fs');
const svgfont2svgicons = require("svgfont2svgicons");

module.exports = bus.on('svgfont2svgicons', function(){

	return (file, opts={}) => {

        return new Promise((resolve, reject) => {

            if ( !/\.svg$/i.test(file) || !File.exists(file) ) {          // 仅简单检查，调用需注意文件正常
                resolve([]);
                return;
            }

            let dist = opts.dist || file.substring(0, file.length - 4); // 文件名目录
            let files = [];
            let mkdir;

            let fontStream = fs.createReadStream(file);
            let iconProvider = svgfont2svgicons();

            fontStream.pipe(iconProvider);
            iconProvider.on('readable', function() {
                let icon, iconfile;
                while ( icon = iconProvider.read() ) {
                    let unicode = icon.metadata.unicode[0].charCodeAt(0).toString(16);
                    let name = icon.metadata.name.toLowerCase();
                    name = name.replace(/[^a-z\d\-_]{1}/g, '-'); // 非规约名

                    iconfile = File.resolve(dist, `${unicode}#${name}.svg`);
                    files.push(iconfile);
                    !mkdir && (mkdir = true) && File.mkdir(dist);
                    icon.pipe(fs.createWriteStream(iconfile));
                }
            }).once('end', function() {
                resolve(files);
            });
        });

	};

}());
