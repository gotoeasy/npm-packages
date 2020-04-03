const reader = require("../lib/reader");
const parser = require("../lib/parser");
const generator = require("../lib/generator");

module.exports = async function (file, opts) {
    let rsReader = await reader({file});
    let rs = await parser(rsReader.result, opts);
    let root = rs.root();

    require("@gotoeasy/file").write('e:/1/ssss.json', JSON.stringify(root,null,2))
    return generator(root);
};
