const csjs = require('@gotoeasy/csjs');
const File = require('@gotoeasy/file');

(async () => {
    // 编译 scss
    let from = File.resolve(__dirname, 'flexbox.scss');
    let to = File.resolve(__dirname, 'flexbox.css');
    let min = File.resolve(__dirname, 'flexbox.min.css');

    let scss = File.read( from );
    let css = csjs.scssToCss(scss);

    css = csjs.formatCss(css);
    File.write(to, css);

    css = await csjs.miniCss(css);
    File.write(min, css);

    console.log('file: flexbox.css, flexbox.min.css');
})();
