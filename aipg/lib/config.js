/* ------- config ------- */
const File = require("@gotoeasy/file");
const Btf = require("@gotoeasy/btf");
const Types = require("./types");

function config() {
    let file = File.resolve(process.cwd(), "aipg.config.btf");
    if (!File.existsFile(file)) return getDefaultConfig();

    let btf = new Btf(file);
    let mapNaming = btf.getMap("naming");
    let naming = {};
    naming.lang = mapNaming.get("lang") || Types.Cn;

    return { naming };
}

function getDefaultConfig() {
    return {
        naming: {
            lang: Types.Cn,
        },
    };
}

module.exports = config();
