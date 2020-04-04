const bus = require("@gotoeasy/bus").newInstance();
const postobject = require('@gotoeasy/postobject');
const Types = require('./types');

module.exports = async function(input){
    let plugins = bus.on("阅读器插件"); // 用bus.on而不是bus.at
    let context = await postobject(plugins).process(input);
    return context;
}
