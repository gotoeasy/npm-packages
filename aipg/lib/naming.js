/* ------- naming ------- */
const bus = require("@gotoeasy/bus");
const File = require("@gotoeasy/file");
const pinyin = require("chinese-to-pinyin");
const Types = require("./types");
const config = require("./config");

let pluginJsFile1 = File.resolve(process.cwd(), "aipg.plugin.naming.js");
let pluginJsFile2 = File.resolve(process.cwd(), "plugins/aipg.plugin.naming.js");
if (File.existsFile(pluginJsFile1)) {
    let fn = require(pluginJsFile1);
    if (typeof fn === "function") {
        bus.on("命名规则插件", fn);
    }
} else if (File.existsFile(pluginJsFile2)) {
    let fn = require(pluginJsFile2);
    if (typeof fn === "function") {
        bus.on("命名规则插件", fn);
    }
}

function customNaming(str, opts) {
    let fns = bus.on("命名规则插件");
    for (let i = 0, fn, nm; (fn = fns[i++]); ) {
        nm = fn(str, opts);
        if (nm) return nm;
    }
}

function packageName(str, opts = {}) {
    opts.type = Types.Var;
    opts.Lang = opts.Lang || Types.Cn;
    let name = customNaming(str, opts);
    if (name) return name;

    return "todo";
}

function className(str, opts = {}) {
    opts.type = Types.Var;
    opts.Lang = opts.Lang || Types.Cn;
    let name = customNaming(str, opts);
    if (name) return name.substring(0, 1).toUpperCase() + name.substring(1);

    name = varName(str, opts);
    return name.substring(0, 1).toUpperCase() + name.substring(1);
}

function methodName(str, opts = {}) {
    opts.type = Types.Var;
    opts.Lang = opts.Lang || Types.Cn;
    let name = customNaming(str, opts);
    if (name) return name;

    return varName(str, opts);
}

function varName(str = "_NothingToNaming_", opts = {}) {
    opts.type = Types.Var;
    let name = customNaming(str, opts);
    if (name) return name;

    if (Types.Cn.toUpperCase() === config.naming.lang.toUpperCase()) {
        // 中文拼音命名法
        let py = pinyin(str, { removeTone: true, keepRest: true }); // pin yin
        if (py.length > 30) {
            py = pinyin(str, { removeTone: true, keepRest: true, firstCharacter: true, removeSpace: true }); // py
        }

        let ary = py.split(/\s+/);
        for (let i = 1, tmp; i < ary.length; i++) {
            tmp = ary[i];
            if (tmp.length > 1) {
                ary[i] = tmp.substring(0, 1).toUpperCase() + tmp.substring(1);
            } else {
                ary[i] = tmp.toUpperCase();
            }
        }
        return ary.join("");
    } else if (Types.Jp.toUpperCase() === config.naming.lang.toUpperCase()) {
        // TODO 日文读音命名法
        let py = pinyin(str, { removeTone: true, keepRest: true }); // pin yin
        if (py.length > 30) {
            py = pinyin(str, { removeTone: true, keepRest: true, firstCharacter: true, removeSpace: true }); // py
        }

        let ary = py.split(/\s+/);
        for (let i = 1, tmp; i < ary.length; i++) {
            tmp = ary[i];
            if (tmp.length > 1) {
                ary[i] = tmp.substring(0, 1).toUpperCase() + tmp.substring(1);
            } else {
                ary[i] = tmp.toUpperCase();
            }
        }
        return ary.join("");
    } else {
        // 英文命名法
        let py = pinyin(str, { removeTone: true, keepRest: true }); // pin yin
        if (py.length > 30) {
            py = pinyin(str, { removeTone: true, keepRest: true, firstCharacter: true, removeSpace: true }); // py
        }

        let ary = py.split(/\s+/);
        for (let i = 1, tmp; i < ary.length; i++) {
            tmp = ary[i];
            if (tmp.length > 1) {
                ary[i] = tmp.substring(0, 1).toUpperCase() + tmp.substring(1);
            } else {
                ary[i] = tmp.toUpperCase();
            }
        }
        return ary.join("");
    }
}

module.exports = { packageName, className, methodName, varName };
