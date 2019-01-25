// ---------------------------------------------
// 读取svg图标文件，转换统一大小，存放缓存并序列化
// ---------------------------------------------
const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const os = require('@gotoeasy/os');
const fs = require('fs');
const svg2ttf = require('svg2ttf');
const ttf2eot = require('ttf2eot');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');

// E000-EFFF共4095个按d值取模定位
module.exports = bus.on('svg-data-to-webfonts', function(){

	return (dist, fontname, keys) => {
        let svgdata = bus.at('cache-svg-data');
        (!keys || !keys.length) && (keys = Object.keys(svgdata));

        genWebfonts(keys, dist, fontname);

	};

}());


function genWebfonts(keys, dist='./dist', fontname='svgiconfont'){

    let fileSvg = File.resolve(dist, fontname + '.svg');
    let fileTtf = File.resolve(dist, fontname + '.ttf');
    let fileEot = File.resolve(dist, fontname + '.eot');
    let fileWoff = File.resolve(dist, fontname + '.woff');
    let fileWoff2 = File.resolve(dist, fontname + '.woff2');

    let svg = genSvgfonts(fontname, keys);
    File.write(fileSvg, svg);

    let ttf = svg2ttf(svg, {});
    let ttfContent = Buffer.from(ttf.buffer);
    fs.writeFileSync(fileTtf, ttfContent);

    let eot = ttf2eot(ttfContent);
    fs.writeFileSync(fileEot, Buffer.from(eot.buffer));

    let woff = ttf2woff(ttfContent);
    fs.writeFileSync(fileWoff, Buffer.from(woff.buffer));

    let woff2 = ttf2woff2(ttfContent);
    fs.writeFileSync(fileWoff2, Buffer.from(woff2.buffer));

    let hashcode = hash(svg);
    let fileCss = File.resolve(dist, 'index.css');
    let css = genCss(fontname, keys, hashcode);
    File.write(fileCss, css);

    let html = genHtml(keys);
    let fileHtml = File.resolve(dist, 'index.html');
    File.write(fileHtml, html);

}

function genSvgfonts(fontname, keys){
    let ary = [];
    ary.push('<?xml version="1.0" standalone="no"?>');
    ary.push('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">');
    ary.push('<svg xmlns="http://www.w3.org/2000/svg">');
    ary.push('<defs>');
    ary.push(`<font id="${fontname}" horiz-adv-x="1000">`);
    ary.push(`<font-face font-family="${fontname}" units-per-em="1000" ascent="1000" descent="0"/>`);
    ary.push('<missing-glyph horiz-adv-x="0"/>');

    let svgdata = bus.at('cache-svg-data');
    keys.forEach( k => ary.push(`<glyph unicode="&#x${svgdata[k].unicode};" glyph-name="${svgdata[k].name || svgdata[k].keywords[0]}" horiz-adv-x="1000" d="${svgdata[k].d}"/>`) );

    ary.push('</font>');
    ary.push('</defs>');
    ary.push('</svg>');

    return ary.join('\n');
}

function genCss(fontname, keys, ver){
    let ary = [];
    ary.push('@font-face {');
    ary.push(`  font-family: '${fontname}';`);
    ary.push(`  src: url('./${fontname}.eot?v=${ver}');`);
    ary.push(`  src: url('./${fontname}.eot?v=${ver}#iefix') format('embedded-opentype'),`);
    ary.push(`    url('./${fontname}.ttf?v=${ver}') format('truetype'),`);
    ary.push(`    url('./${fontname}.woff2?v=${ver}') format('woff2'),`);
    ary.push(`    url('./${fontname}.woff?v=${ver}') format('woff'),`);
    ary.push(`    url('./${fontname}.svg?v=${ver}') format('svg');`);
    ary.push('  font-weight: normal;');
    ary.push('  font-style: normal;');
    ary.push('}');
    ary.push('');

    ary.push('.icon {');
    ary.push(`  font-family: "${fontname}";`);
    ary.push('  font-weight: normal;');
    ary.push('  font-style: normal;');
    ary.push('  font-feature-settings: normal;');
    ary.push('  -webkit-font-smoothing: antialiased;');
    ary.push('  -moz-osx-font-smoothing: grayscale;');
    ary.push('}');
    ary.push('');

    let svgdata = bus.at('cache-svg-data');
    keys.forEach( k => ary.push(`.${svgdata[k].name || svgdata[k].keywords[0]}:before { content: "\\${svgdata[k].unicode}"; }`) );
    ary.push('');

    return ary.join('\n');
}

function genHtml(keys){
    
    let ary = [];
    ary.push('<!doctype html>');
    ary.push('<html lang="en">');
    ary.push('<head>');
    ary.push('<meta charset="utf-8">');
    ary.push('<meta http-equiv="Cache-Control" content="no-cache"/>');
    ary.push('<meta http-equiv="X-UA-Compatible" content="IE=edge">');
    ary.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
    ary.push(`<link href="./index.css" rel="stylesheet">`);
    ary.push('</head>');
    ary.push('<body>');

    let svgdata = bus.at('cache-svg-data');
    ary.push('<div style="margin:0 auto;display:block;">');
    ary.push('<ul style="text-align:center;list-style:none;margin:0;padding:0;">');
    keys.forEach( k => {
        ary.push('<li style="width:100px;height:70px;text-align:center;float:left;background-color:beige;margin:1px;padding-top:10px;">');
        ary.push(`<i class="icon ${svgdata[k].name || svgdata[k].keywords[0]}"></i>`);
        ary.push(`<br><span style="font-size:13px">${svgdata[k].keywords.join('<br>')}</span>`);
        ary.push('</li>');
    });
    ary.push('</ul></div>');

    ary.push('</body>');
    ary.push('</html>');

    return ary.join('\n');
};
