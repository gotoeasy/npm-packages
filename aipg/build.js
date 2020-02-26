const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');

(async ()=>{
    await run();
})();

async function run(){

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

    let sentences = await readSentences();

    js = `module.exports = (function(){
        const bus = require("@gotoeasy/bus");
        const postobject = require("@gotoeasy/postobject");

        console.time('load');

        ${sentences}

        ${js}

    }());
    `;

    js = csjs.formatJs(js);         // 便于确认代码，格式化代码且不删除注释

    File.write(__dirname + '/index.js', js);
}

function getIndexSrc(){

    return `

// ------------------------ index ------------------------

const bus = require('@gotoeasy/bus');

async function build(opts){
    let stime = new Date().getTime();

    try{
        bus.at('环境', opts);
        bus.at('clean');

        await bus.at('全部编写');
    }catch(e){
        console.error('build failed', e);
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
        console.error('clean failed', e);
    }

    let time = new Date().getTime() - stime;
    console.info('clean ' + time + 'ms');       // 异步原因，统一不使用time/timeEnd计时
}


async function watch(opts){

    await build(opts);
    bus.at('文件监视');

}

    let f = s => bus.at("句型转正则", s);

    return { build, clean, watch, f };

//return { build, clean, watch };


    `;

}


async function readSentences(){

    let XlsxPopulate = require('xlsx-populate');
    let workbook = await XlsxPopulate.fromFileAsync('src/00-sentence.xlsx');
    let sheet = workbook.sheet('句型');

    let ary = [];
    for (let i=2; i<100; i++) {
        let id = i - 1;
        let type = sheet.cell('B' + i).value();
        let sentence = sheet.cell('C' + i).value();
        let regexp = /^(?:如果|若)(.+)[，,\\n]\s*(则|那么)?(.+)[．.。]?$/.toString();
        let note = sheet.cell('E' + i).value();

        if (sentence && sentence.get) {
            // 富文本
            let txt = '';
            for (let i=0,fragment,val; fragment=sentence.get(i++); ) {
                val = fragment.value();
                if ( val != null ) {
                    txt += val;
                }
            }
            sentence = txt;
        }

        if (type && sentence) {
            ary.push({id, type, sentence, regexp, note});
        }else{
            break;
        }
    }

    let src = JSON.stringify(ary, null, 4);
    let arySrc = src.split('\n');
    for (let i=0,str; i<arySrc.length; i++) {
        str = arySrc[i];
        if (/^\s*"regexp"/.test(str)) {
            str = str.replace(/"regexp": "/, '"regexp": ').replace(/",$/, ',').replace(/"$/, '');
            arySrc[i] = str;
        }
    }

    let rs = arySrc.join('\r\n');
    rs = `
        // ------- build sentences start
        bus.on("句型", function() {
            let sentences = ${rs};

            return function() {
                return sentences;
            };
        });
        // ------- build sentences end

    `;
    
   // console.info(rs);
    return rs;

}

