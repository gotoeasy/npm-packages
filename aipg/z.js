
(async () => {
    
   // const aipg = require('./index');

   // await aipg.build({file: './test.xlsx'});

   // let fnReg = aipg.f('如果/假如/当 … 时[,/，][则/那么/的时候/时]…');
   // console.info(fnReg);
   // console.info('当金额大于1万元时做审批'.match(fnReg));


    const main = require('./lib/main');

    let src = await main('E:\\github\\npm-packages\\aipg\\src\\20-parser\\test-case\\g01p-fix-node-type-method-note.js.xlsx');
    console.info(src)
    
})();
