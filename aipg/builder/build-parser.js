const File = require('@gotoeasy/file');
const csjs = require('@gotoeasy/csjs');
const Btf = require('@gotoeasy/btf');
const fs = require('fs');

module.exports = function (){

    let packageFile = File.resolve(__dirname, '../package.json');

    let ary = [];
    let files = File.files(File.path(packageFile), 'src/20-parser/**.js');
    files.sort();

    files.forEach(f => {
        let name = File.name(f);
        let src = File.read(f);
        ary.push(`/* ------- ${name} ------- */`);
        ary.push(src.replace(/\/\*\*\/__filename\/\*\*\//, `'${File.filename(f)}'`));
    });

    let js = ary.join('\r\n');
    try{
        js = csjs.formatJs(js);                                                     // 便于确认代码，格式化代码且不删除注释
    }catch(e){
        console.error(e)
    }
    let jsFile = File.resolve(__dirname, '../lib/parser.js');
    File.write(jsFile, js);

    // 构建生成测试代码
    buildGeneratorTest(packageFile);

    // 复制测试用的excel文件
    let excels = File.files(File.path(packageFile), 'src/20-parser/test-case/*.xlsx');
    File.mkdir(File.path(File.resolve(__dirname, `../test/parser/tmp.txt`)));
    excels.forEach(f => {
        let to = File.resolve(__dirname, `../test/parser/${File.filename(f)}`);
        fs.copyFileSync(f, to);
    });

    console.info('lib/parser.js', '......', 'OK');
}

function buildGeneratorTest(packageFile){
    let ary = [];
    let files = File.files(File.path(packageFile), 'src/20-parser/**.btf');
    files.sort();


    ary.push(`const test = require('ava');`);
    ary.push(``);
    ary.push(`// ----------------------------------------------`);
    ary.push(`// parser测试`);
    ary.push(`// ----------------------------------------------`);
    ary.push(`const postobject = require('@gotoeasy/postobject');`);
    ary.push(`const reader = require('../lib/reader');`);
    ary.push(`const parser = require('../lib/parser');`);

    let constFiles = File.files(File.path(packageFile), 'src/20-parser/*-consts-*.js');
    constFiles.forEach(f => ary.push(File.read(f)));

    files.forEach(f => {
        let name = File.name(f);
        let btf = new Btf(f);
        let docs = btf.getDocuments();
        let idx = docs.length > 1 ? 1 : 0;
        docs.forEach(doc => {
            // 拼装测试脚本
            let note = idx ? ` - case ${idx++}` : '';
            let testjs = doc.getText('test');
            testjs = testjs.replace(/\{FILE_NAME\}/g, name);
            ary.push(``);
            ary.push(`test('parser: ${name}${note}', ${testjs});`);

        });

    });
    let testFile = File.resolve(__dirname, '../test/test-parser.js');
    let js = ary.join('\r\n');
    try{
        js = csjs.formatJs(js);                                                     // 便于确认代码，格式化代码且不删除注释
    }catch(e){
        console.error(e)
    }
    File.write(testFile, js);
}
