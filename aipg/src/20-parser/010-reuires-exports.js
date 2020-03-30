const bus = require("@gotoeasy/bus").newInstance();
const postobject = require('@gotoeasy/postobject');

module.exports = async function(oSheet, opts){
    let plugins = bus.on("解析器插件"); // 用bus.on而不是bus.at
    let context = await postobject(plugins).process(oSheet, opts);
    return context;
}
