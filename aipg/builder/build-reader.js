const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');
const Btf = require('@gotoeasy/btf');
const fs = require('fs');

module.exports = function (){

    let packageFile = File.resolve(__dirname, '../package.json');

    let ary = [];
    let files = File.files(File.path(packageFile), 'src/10-reader/**.js');
    files.sort();

    files.forEach(f => {
        let name = File.name(f);
        let src = File.read(f);
        ary.push(`/* ------- ${name} ------- */`);
        ary.push(src);
    });

    let js = ary.join('\r\n');
    try{
        js = csjs.formatJs(js);                                                     // 便于确认代码，格式化代码且不删除注释
    }catch(e){
        console.error(e)
    }
    let jsFile = File.resolve(__dirname, '../lib/reader.js');
    File.write(jsFile, js);

    // 构建生成测试代码
    buildGeneratorTest(packageFile);

    // 复制测试用的excel文件
    let excels = File.files(File.path(packageFile), 'src/10-reader/test-case/*.xlsx');
    File.mkdir(File.path(File.resolve(__dirname, `../test/reader/tmp.txt`)));
    excels.forEach(f => {
        let to = File.resolve(__dirname, `../test/reader/${File.filename(f)}`);
        fs.copyFileSync(f, to);
    });

    console.info('lib/reader.js', '......', 'OK');
}

function buildGeneratorTest(packageFile){
    let ary = [];
    let files = File.files(File.path(packageFile), 'src/10-reader/**.btf');
    files.sort();

    ary.push(`const test = require('ava');`);
    ary.push(``);
    ary.push(`// ----------------------------------------------`);
    ary.push(`// reader测试`);
    ary.push(`// ----------------------------------------------`);
    ary.push(`const Types = require('../lib/types');`);
    ary.push(`const reader = require('../lib/reader');`);

    files.forEach(f => {
        let name = File.name(f);
        let btf = new Btf(f);
        let docs = btf.getDocuments();
        let idx = docs.length > 1 ? 1 : 0;
        docs.forEach(doc => {
            // 拼装测试脚本
            let note = idx ? ` - case ${idx++}` : '';
            let testjs = doc.getText('test');
            if (testjs) {
                ary.push(``);
                testjs = testjs.replace(/\{FILE_NAME\}/g, name);
                ary.push(`test('reader: ${name}${note}', ${testjs});`);
            }else{
                let node = doc.getText('node');
                if (node) {
                    let src = doc.getText('src');
                    let obj = {src};

                    ary.push(``);
                    ary.push(`test('reader: ${name}${note}', t => {`);
                    ary.push(`let node = ${node}`);
                    ary.push(`let oTest = ${JSON.stringify(obj)}`);
                    ary.push(`let src = reader(node);`);
                    ary.push(`t.is(src, oTest.src);`);
                    ary.push(`});`);
                }
            }

        });

    });
    let testFile = File.resolve(__dirname, '../test/test-reader.js');
    let js = ary.join('\r\n');
    try{
        js = csjs.formatJs(js);                                                     // 便于确认代码，格式化代码且不删除注释
    }catch(e){
        console.error(e)
    }
    File.write(testFile, js);
}
