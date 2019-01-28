const bus = require('@gotoeasy/bus');

require('./lib/loadModules')();

module.exports = {
    exp: (svgfont, opts={}) => bus.at('svgfont2svgicons', svgfont, opts)
  , imp: (...files) => bus.at('import-to-svg-data', ...files)
  , webfonts: (...files) => bus.at('import-to-svg-data', ...files).then(rs => bus.at('svg-data-to-webfonts'))
};


