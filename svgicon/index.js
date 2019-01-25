const bus = require('@gotoeasy/bus');

require('./lib/loadModules')();

module.exports = {
    exp: (svgfont, opts={}) => bus.at('svgfont2svgicons', './testfont.svg', opts)
  , webfonts: (svgdir, opts={}) => bus.at('svgicons-normalize-to-svg-data', svgdir, opts).then(rs => bus.at('svg-data-to-webfonts'))
};


