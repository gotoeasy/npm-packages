const reader = require("./lib/reader");
const parser = require("./lib/parser");
const generator = require("./lib/generator");

module.exports = async function (file, opts) {
    let rsReader = await reader({file});
    let rsParser = await parser(rsReader.result, opts);
    return generator(rsParser.root());
};
