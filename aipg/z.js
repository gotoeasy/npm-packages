
(async () => {
    
    const aipg = require('./index');

    //await aipg.build({file: './test.xlsx'});

    let fnReg = aipg.f('如果/假如 … ,/，[则/那么/的时候/时]…');
    console.info(fnReg);
    console.info('如果 s,退出'.match(fnReg));

    
})();
