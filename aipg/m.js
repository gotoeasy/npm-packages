(async ()=>{
    const reader = require("./lib/reader");
    const parser = require("./lib/parser");
    const generator = require("./lib/generator");

    let file = './helloworld.xlsx';
    let rsReader = await reader({file});
    let rs = await parser(rsReader.result);
    let root = rs.root();

    require("@gotoeasy/file").write('e:/1/generator-in.json', JSON.stringify(root, null, 2));
    let src = generator(root);
    console.info(src)
    
})().then();
