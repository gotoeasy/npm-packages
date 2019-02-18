const os = require('@gotoeasy/os');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const PTask = require('@gotoeasy/p-task');
const cssSelectorClasses = require('@gotoeasy/css-selector-classes');
const postcss = require('postcss');
const postcssUrl = require('postcss-url');

// ---------------------------------------------------
// 按需引用CSS
// TODO 全局变量、字体
// ---------------------------------------------------
module.exports = (function (){

    let ptask = new PTask((resolve, reject, isBroken) => async function(fileOrCss, opt){

        let isCssFile = File.existsFile(fileOrCss);
        let css = isCssFile ? File.read(fileOrCss) : fileOrCss;
        let pkg = opt.pkg || (isCssFile ? File.name(fileOrCss) : '');
        let oVer = JSON.parse(File.read(File.resolve(__dirname, 'package.json')));
        let filename = `${pkg?(pkg+'-'):''}${hash(css)}-${oVer.version}.json`;
        let datafile = File.resolve(os.homedir(), `.cache/csslibify/${oVer.version}/${filename}`);

        // 有缓存则使用
        if ( opt.usecache && File.exists(datafile) ) {
            let oResult = JSON.parse(File.read(datafile));
            return resolve( oResult );
        }

        // 修改url并复文件哈希化文件名
        let url = 'copy';
        let from = File.existsFile(fileOrCss) ? fileOrCss : 'from.css';
        let to = File.resolve(File.path(datafile), 'to.css');
        let basePath = File.path(from);
        let assetsPath = File.path(to);
        let useHash = true;
        let hashOptions = { method: contents => hash({contents}) };
        let postcssUrlOpt = {url, from, to, basePath, assetsPath, useHash, hashOptions };
	    let plugins = [postcssUrl(postcssUrlOpt)];
        let rs = await postcss(plugins).process(css, {from});

        // 用postcss遍历拆解样式，但不修改样式
        css = rs.css;
        let lines = css.split('\n');
        let nodes = [];
    	let plugin = function (root, result) {
            root.walkRules( rule => nodes.push(...getRulrTemplateNodes(lines, rule)) );
        };

        postcss([plugin]).process(css, {from}).then( (rs, err) => {
            if ( err ) {
                reject(err);
            }else{
                let oResult = {pkg, nodes};
                File.write(datafile, JSON.stringify(oResult));
                resolve( oResult );
            }
        });

    });

    return async (fileOrCss, opt={usecache:true}) => {
        let oRs = await ptask.start(fileOrCss, opt);    // 仅数据
        // 添加处理函数
        oRs.get = getCss;                           // 传入多个类名取得相关样式
        oRs.rename = opt.rename || defaultRename;   // 传入包名和类名用于修改类名，默认策略：pkgname---classname
        return oRs;
    };

})();

// 默认类名修改策略：pkgname---classname
function defaultRename(pkgname, cls) {
    return `.${pkgname?(pkgname+'---'):''}${cls.substring(1)}`;
}


// 按需引用CSS
function getCss(...requirenames){
    let rs = [];
    for ( let i=0,node; node=this.nodes[i++]; ) {
        let match = true;
        for ( let j=0,name; name=node.classes[j++]; ) {
            if ( !requirenames.includes(name) ) {
                match = false;
                break;
            }
        }
        if ( match ) {
            let newSelector = node.selectortemplate;
            let csstemplate = node.csstemplate;
            for ( let i=0,cls; cls=node.classes[i++]; ) {
                newSelector = newSelector.replace(`.___---${cls.substring(1)}---___`, `${this.rename(this.pkg, cls)}`);   // 改类名
            }
            rs.push( node.csstemplate.replace('##selector##', newSelector) );                               // 更新选择器
        }
    }
    return rs.join('\n');
}

// 拆解样式
function getRulrTemplateNodes(lines, rule){

    // 分解出selector和样式内容
    let startLine = rule.source.start.line, startColumn = rule.source.start.column;
    let endLine = rule.source.end.line, endColumn = rule.source.end.column;

    let ary = [];
    if ( startLine === endLine ) {
        ary.push( lines[startLine-1].substring(startColumn-1, endColumn) );
    }else{
        for ( let i=startLine-1,str; i<endLine; i++ ) {
            if ( i === startLine-1 ) {
                ary.push( lines[i].substring(startColumn-1) );
            }else if ( i === endLine-1 ) {
                ary.push( lines[i].substring(0, endColumn) );
            }else{
                ary.push( lines[i] );
            }
        }
    }

    let body = ary.join('\n').substring(rule.selector.length);

    let parent = rule.parent;
    let atruleCss = '##css##';
    if ( parent.type === 'atrule' ) {        // 如@media等，被嵌套在atrule中，需保留atrule嵌套关系
        while ( parent.type === 'atrule' ) {
            atruleCss = `@${parent.name} ${parent.params} {\n ${atruleCss}\n}`;
            parent = parent.parent;
        }
    }

    // 找出全部类名封装成对象返回
    let rs = [];
    rule.selectors.forEach(selector => {
        let csstemplate = atruleCss.replace('##css##', `##selector##${body}`);  // 样式模板，##selector##待替换
        let oSel = cssSelectorClasses(selector);
        let selectortemplate = oSel.template;                                     // 选择器模板，各##类名##待替换
        let classes = oSel.classes;
        rs.push({selector, body, selectortemplate, csstemplate, classes});
    });
    
    return rs;
}
