const os = require('@gotoeasy/os');
const File = require('@gotoeasy/file');
const hash = require('@gotoeasy/hash');
const PTask = require('@gotoeasy/p-task');
const cssSelectorClasses = require('@gotoeasy/css-selector-classes');
const cssSelectorElements = require('@gotoeasy/css-selector-elements');
const postcss = require('postcss');

// ---------------------------------------------------
// 按需引用CSS
// TODO 全局变量、字体
// ---------------------------------------------------
module.exports = (function (){

    let ptask = new PTask((resolve, reject, isBroken) => async function(pkg, fileOrCss, usecache, basePath, assetsPath){

        let isCssFile = File.existsFile(fileOrCss);
        let css = isCssFile ? File.read(fileOrCss) : fileOrCss;
        let oVer = JSON.parse(File.read(File.resolve(__dirname, 'package.json')));
        let filename = `${pkg?(pkg+'-'):''}${hash(css)}-${oVer.version}.json`;
        let datafile = File.resolve(os.homedir(), `.cache/csslibify/${oVer.version}/${filename}`);

        // 有缓存则使用
        if ( usecache && File.exists(datafile) ) {
            let oResult = JSON.parse(File.read(datafile));
            return resolve( oResult );
        }

        // 修改url并复文件哈希化文件名
        let url = 'copy';
        let from = File.existsFile(fileOrCss) ? fileOrCss : 'from.css';
        let to = File.resolve(File.path(datafile), 'to.css');
        basePath = basePath || File.path(from);
        assetsPath = assetsPath || File.path(to);
        let useHash = true;
        let hashOptions = { method: contents => hash({contents}) };
        let postcssUrlOpt = {url, from, to, basePath, assetsPath, useHash, hashOptions };
	    let plugins = [];
        plugins.push( require('postcss-url')(postcssUrlOpt) );                  // url资源复制
        plugins.push( require('postcss-discard-comments')({remove:x=>1}) );     // 删除所有注释
        plugins.push( require('postcss-remove-prefixes')() );                   // 删除前缀
        plugins.push( require('postcss-nested')() );                            // 支持嵌套（配合下面变量处理）
        plugins.push( require('postcss-css-variables')() );                     // 把css变量静态化输出
        let rs = await postcss(plugins).process(css, {from});

        // 用postcss遍历拆解样式，但不修改样式
        css = rs.css;
        let lines = css.split('\n');
        let nodes = []; // 【node】 selector：原selector, body：原body, selectortemplate：替换用选择器模板, csstemplate：替换用样式模板, classes
        let keyframes = [];
    	let keyframesPlugin = function (root, result) {
            root.walkAtRules('keyframes', rule => {
//console.info('-------walkAtRules------')
                parseAtRuleKeyframes(lines, rule, keyframes)
            });
        };

    	let classPlugin = function (root, result) {

            root.walkRules( rule => {
                nodes.push(...getRuleTemplateNodes(lines, rule));
            });

        };

        postcss([keyframesPlugin, classPlugin]).process(css, {from}).then( (rs, err) => {
            if ( err ) {
                reject(err);
            }else{
                let oResult = {pkg, keyframes, nodes, basePath: File.path(to)};
                File.write(datafile, JSON.stringify(oResult, null, 4));
                resolve( oResult );
            }
        });

    });

    // -----------------------------------------------------------------------------------------------
    // 入口 （异步函数）
    // 【参数】
    // pkg                      : 样式库别名 （必须输入）
    // fileOrCss                : 样式文件或内容 （必须输入）
    // opt.usecache             : 是否使用缓存 （默认true）
    // opt.includeElementRule   : 引用样式时是否要包含关联标签的样式引用 （默认false）
    // opt.basePath             : 样式所在目录 （文件时默认为文件所在目录）
    // opt.assetsPath           : 修改后的url资源目录 （默认复制资源后使用该资源的绝对路径）
    // opt.rename               : 样式类名的改名函数 （默认(pkgnm, cls) => `${pkgnm?(pkgnm+'---'):''}${cls}`）
    // 【返回】
    // result.get               : 按指定样式类取得相关的样式，参数为1~n个样式类名
    // result.basePath          ： 样式所在目录
    // -----------------------------------------------------------------------------------------------
    return async (pkg, fileOrCss, opt={usecache:true, includeElementRule: false}) => {
        let oRs = await ptask.start(pkg, fileOrCss, !!opt.usecache, opt.basePath, opt.assetsPath);    // 仅数据

        // 样式类名修改函数
        let fnRename = opt.rename || ( (pkgnm, cls) => `${pkgnm?(pkgnm+'---'):''}${cls}` );   // 默认策略：pkgname---classname

        // 按需引用CSS，返回方法对象不含数据，避免被修改，便于复用
        let get = (...requirenames) => {
            if ( !requirenames.length ) {
                return '';
            }

            let oSet = new Set(requirenames.join('\n').replace(/\./g, '').split('\n'));
            let oSetKeyframes = new Set();
            let oSetElements = new Set();

            let rs = [];
            for ( let i=0,node; node=oRs.nodes[i++]; ) {

                // 节点类全在范围内才视为匹配
                let match = !!node.classes.length;
                for ( let j=0,cls; cls=node.classes[j++]; ) {
                    if ( !oSet.has(cls.toLowerCase()) ) {
                        match = false;
                        break;
                    }
                }
                if ( match ) {
                    let newSelector = node.selectortemplate;
                    let csstemplate = node.csstemplate;
                    for ( let i=0,cls; cls=node.classes[i++]; ) {
                        newSelector = newSelector.replace(`___---${cls}---___`, `${fnRename(pkg, cls)}`);   // 改类名
                    }
                    rs.push( node.csstemplate.replace('##selector##', newSelector) );                       // 更新选择器

                    // 导入关联@keyframes
                    node.animations.forEach(animation => {
                        oRs.keyframes.forEach(kf => {           // name, template
                            if ( kf.name === animation ) {
                                let newkfname = fnRename(pkg, animation);
                                oSetKeyframes.add(kf.template.replace('##keyframesname##', newkfname));
                                let css = rs.pop();
                                let reg = new RegExp('animation\\s*:\\s*' + animation, 'ig');    // 无视animation名称中可能影响正则表达式的特殊字符，通常也就一个动画设定，仅简单替换处理
                                css = css.replace(reg, 'animation:' + newkfname); 
                                rs.push(css);
                            }
                        });
                    });

                    // 关联element名
                    node.elements.forEach(el => oSetElements.add(el));
                }

            }

            // 添加关联标签的样式定义
            if ( opt.includeElementRule && oSetElements.size ) {
                oSetElements.add('html') > oSetElements.add('body');  // 自动添加全局关联的两个标签
                [...oSetElements].forEach(elname => {
                    oRs.nodes.forEach(node => {
                        if ( !node.classes.length && node.elements.length === 1 && node.elements[0] === elname ) {
                            rs.push(node.selector + node.body);
                        }else if ( node.selector === '*') {
                            rs.push(node.selector + node.body); // 虽然不是标签，但对全体标签生效的特殊规则，也要
                        }
                    });
                })
            }

            rs.push(...oSetKeyframes);
            return [...new Set(rs)].join('\n');
        };

        return { get, basePath: oRs.basePath };
    };

})();

// 拆解样式
function getRuleTemplateNodes(lines, rule){
    if ( rule.parent.type === 'atrule' && /keyframes/i.test(rule.parent.name) ) {
        return [];
    }

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

    let nodes = rule.nodes || [];
    let animations = [];
    nodes.forEach(node => {
        if ( node.type === 'decl' && node.prop === 'animation' ) {
            let name = node.value;
            name.indexOf(' ') > 0 && (name = name.split(' ')[0]);
            animations.push(name);
        }
    });
    animations = [...new Set(animations)];

    // 找出全部类名封装成对象返回
    let rs = [];
    rule.selectors.forEach(selector => {
        let csstemplate = atruleCss.replace('##css##', `##selector##${body}`);  // 样式模板，##selector##待替换
        let oCls = cssSelectorClasses(selector);
        let selectortemplate = oCls.template;                                     // 选择器模板，各##类名##待替换
        let classes = oCls.classes;
        let elements = cssSelectorElements(selector);
        rs.push({selector, body, selectortemplate, csstemplate, classes, elements, animations});
    });
    
    return rs;
}


// @keyframes样式特殊处理
function parseAtRuleKeyframes(lines, rule, keyframes){

    if ( rule.type === 'atrule' && rule.name === 'keyframes' ) {
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

        let src = ary.join('\n');
        let name = rule.params; // keyframes名
        let template = `@${rule.name} ##keyframesname##` + src.substring(src.indexOf(rule.params, 10) + rule.params.length); // 模板
        
        keyframes.push( {name, template} );
        return true;
    }

}
