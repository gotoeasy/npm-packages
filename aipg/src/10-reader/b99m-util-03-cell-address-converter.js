// 给定一个地址(如A1或A1:B3)，转换为地址对象{addr, startRow, endRow, startColumn, endColumn}
bus.on('地址转换', (addr) => {
    if (!addr || typeof addr !== "string") return null;

    addr = addr.toUpperCase();
    let cell, startRow, endRow, startColumn, endColumn, match;
    if ( addr.indexOf(':') > 1 ) {
        match = addr.match(/([A-Z]+)([0-9]+):([A-Z]+)([0-9]+)/);
        startColumn = bus.at('列名转数字', match[1]);
        endColumn = bus.at('列名转数字', match[3]);
        startRow = match[2] - 0;
        endRow = match[4] - 0;
        cell = match[1] + match[2];                                     // 起始单元格地址
    }else{
        match = addr.match(/([A-Z]+)([0-9]+)/);
        startColumn = endColumn = bus.at('列名转数字', match[1]);
        startRow = endRow = match[2] - 0;
        cell = addr;                                                    // 起始单元格地址
    }

    return {cell, addr, startRow, endRow, startColumn, endColumn};
});

bus.on('数字转列名', iColumn => {
    let dividend = iColumn;
    let name = '';
    let modulo = 0;

    while (dividend > 0) {
        modulo = (dividend - 1) % 26;
        name = String.fromCharCode('A'.charCodeAt(0) + modulo) + name;
        dividend = Math.floor((dividend - modulo) / 26);
    }

    return name;
});

bus.on('列名转数字', columnName => {
    let sum = 0;
    for (let i = 0; i < columnName.length; i++) {
        sum = sum * 26;
        sum = sum + (columnName[i].charCodeAt(0) - 'A'.charCodeAt(0) + 1);
    }
    return sum;
});

bus.on('地址起始列数字', addr => {
    let match = addr.match(/^[A-Z]+/);
    return match ? bus.at('列名转数字', match[0]) : 0;      // 错误地址返回0
});
