const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');

    let fileIndex = File.resolve(__dirname, './index.js');

    let ary = [];
    let files = File.files(__dirname, 'src/**.js');
    files.sort();
            
    ary.push("console.time('load');");

    files.forEach(f => {
        let name = File.name(f);
        let isUtils = /-util/i.test(name);
        let src = File.read(f);
        if ( name !== 'all' ) {
            ary.push(`/* ------- ${name} ------- */`);
            !isUtils && ary.push('(() => {');
            ary.push(`// ------- ${name} start`);
            ary.push(`  ${src.replace(/\/\*\*\/__filename\/\*\*\//g, "'" + name + "'")}`);
            ary.push(`// ------- ${name} end`);
            !isUtils && ary.push('})();');
            ary.push('');
        }
    });

    ary.push("console.timeEnd('load');");

    ary.push(getIndexSrc());

    let js = ary.join('\r\n');
    js = js.replace(/const\s+bus\s*=\s*require\(\s*['"]{1,1}@gotoeasy\/bus['"]{1,1}\)\s*[;]*/g, '');
    js = js.replace(/const\s+postobject\s*=\s*require\(\s*['"]{1,1}@gotoeasy\/postobject['"]{1,1}\)\s*[;]*/g, '');

    js = `const bus = require("@gotoeasy/bus");
    const postobject = require("@gotoeasy/postobject");

    ${js}
    `

    js = csjs.formatJs(js);         // 便于确认代码，格式化代码且不删除注释

    File.write(__dirname + '/index.js', js);


function getIndexSrc(){

    return `

// ------------------------ index ------------------------

const bus = require('@gotoeasy/bus');
const Err = require('@gotoeasy/err');

async function build(opts){
    let stime = new Date().getTime();

    try{
        bus.at('环境', opts);
        bus.at('clean');

        await bus.at('全部编写');
    }catch(e){
        console.error(Err.cat('build failed', e).toString());
    }

    let time = new Date().getTime() - stime;
    console.info('build ' + time + 'ms');       // 异步原因，统一不使用time/timeEnd计时
}

function clean(opts){
    let stime = new Date().getTime();

    try{
        bus.at('环境', opts);
        bus.at('clean');
    }catch(e){
        console.error(Err.cat('clean failed', e).toString());
    }

    let time = new Date().getTime() - stime;
    console.info('clean ' + time + 'ms');       // 异步原因，统一不使用time/timeEnd计时
}


async function watch(opts){

    await build(opts);
    bus.at('文件监视');

}

module.exports = { build, clean, watch };


    `;

}