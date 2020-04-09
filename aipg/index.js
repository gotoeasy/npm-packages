const reader = require("./lib/reader");
const parser = require("./lib/parser");
const generator = require("./lib/generator");

module.exports = async function (file, opts) {
    return generator(await parser(await reader({file}).result, opts).root());
};
