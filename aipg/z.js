
(async () => {
    
    const aipg = require('./index');

    //await aipg.build({file: './test.xlsx'});

    let fnReg = aipg.f('如果/假如/当 … 时[,/，][则/那么/的时候/时]…');
    console.info(fnReg);
    console.info('当金额大于1万元时做审批'.match(fnReg));

    
})();
