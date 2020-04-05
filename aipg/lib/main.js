const reader = require("../lib/reader");
const parser = require("../lib/parser");
const generator = require("../lib/generator");
const csjs = require("@gotoeasy/csjs");

module.exports = async function (file, opts) {

    let root = await parser(await reader({file}).result, opts).root();

    require("@gotoeasy/file").write('e:/1/ssss.json', JSON.stringify(root,null,2))
    let src = generator(root);
    try{
        src = csjs.formatJava(src)
    }catch(e){
        console.error('format java fail', e);
    }
    return src;
};
