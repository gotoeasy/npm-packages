const bus = require('@gotoeasy/bus');

// 工具函数
bus.on('空白', function (val){
    return !val || /^\s*$/.test(val);
});
bus.on('非空白', function (val){
    return !bus.at('空白', val);
});

bus.on('正则转义', function (str){
    return str.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&');
});

bus.on('查找引号内容', function (){
    const aryLeft  = [`“`, `【`, `〖`, `『`, `《`, `「`, `［`, `[`, `'`, `"`, `‘`, `《`];
    const aryRight = [`”`, `】`, `〗`, `』`, `》`, `」`, `］`, `]`, `'`, `"`, `’`, `》`];

    // 可指定起始字符
    return function (str, cLeft, cRight){
        let idxLeft,idxRight;

        // 指定起始字符时，按指定的查找
        if (cLeft && cRight) {
            idxLeft = str.indexOf(cLeft);
            if (idxLeft < 0) return null;

            idxRight = str.indexOf(cRight, idxLeft+cLeft.length);
            if (idxRight < 0) return null;

            // 前一字符是反斜杠时继续往后找
            while (str.substring(idxRight-1, idxRight) === '\\') {
                idxRight = str.indexOf(cRight, idxRight+cRight.length);
                if (idxRight < 0) return null;
            }

            return str.substring(idxLeft, idxRight+cRight.length);
        }

        // 未指定起始字符时，按默认规则查找
        for (let i=0,ch; ch=aryLeft[i++]; ) {
            idxLeft = str.indexOf(ch);
            if (idxLeft < 0) continue;

            idxRight = str.indexOf(aryRight[i-1], idxLeft+1);
            if (idxRight < 0) continue;

            // 前一字符是反斜杠时继续往后找
            while (str.substring(idxRight-1, idxRight) === '\\') {
                idxRight = str.indexOf(cRight, idxRight+cRight.length);
                if (idxRight < 0) return null;
            }

            return str.substring(idxLeft, idxRight+1);
        }
        return null;
    }
}());


bus.on('句型转正则', function (){
    const aryKey  = '⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛'.split('');                   // 临时替代引号内容的特殊字符

    return function (sentencePattern){

        if (typeof sentencePattern !== 'string' || !sentencePattern) {
            return null;
        }

        let pattern = sentencePattern;
        let oReplace = {};
        let match, idx = 0;

        // 中括号内容处理
        while ( match = bus.at('查找引号内容', pattern, '[', ']') ) {                       // 查取中括号内容
            pattern = pattern.replace(match, aryKey[idx]);                                  // 替换中括号内容： aaa[nnn]bbb[xxx]ccc -> aaa⒈bbb[xxx]ccc

            let ary = match.substring(1, match.length-1).split('/');                        // 去除两边中括号，内容按斜杠分割
            for (let i=0; i<ary.length; i++) {
                ary[i] = bus.at('正则转义', ary[i]);                                        // 分割内容按正则语法转义
            }

            match = '(?:' + ary.join('|') + ')?';                                           // 中括号内容转正则字符串： [nnn/xxx/yyy] -> (?:nnn|xxx|yyy)?
            oReplace[aryKey[idx]] = match;                                                  // 保存正则字符串： ⒈ : (?:nnn|xxx|yyy)?
            idx++;
        }

        // 省略号处理
        let sTmp, aryPattern = pattern.split(/\s?…\s?/);
        for (let i=0; i<aryPattern.length; i++) {
            let ary = aryPattern[i].split(/[⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛]/);
            for (let j=0; j<ary.length; j++) {
                let aryTmp = ary[j].split('/');
                sTmp = '';
                let hasOr = false;
                for (let k=0; k<aryTmp.length; k++) {
                    if (k === aryTmp.length - 1) {
                        sTmp += bus.at('正则转义', aryTmp[k]);
                    }else{
                        if (/[0-9１２３４５６７８９０/]\s*$/.test(aryTmp[k])                // 斜杠前跟着的是数字或斜杠
                            || /^\s*[0-9１２３４５６７８９０/]/.test(aryTmp[k+1])) {        // 斜杠后跟着的是数字或斜杠
                            sTmp += bus.at('正则转义', aryTmp[k] + '/');                    // 按正常斜杠看待
                        }else{
                            sTmp += bus.at('正则转义', aryTmp[k]) + '|';                    // 斜杠是或的意思，转义成正则语法字符
                            hasOr = true;
                        }
                    }
                }
                hasOr && (sTmp = '(?:' + sTmp + ')+');                                      // aaa|bbb -> (?:aaa|bbb)+

                ary[j] = sTmp;                                                              // 转义后的正则字符串
            }

            sTmp = '';
            for (let j=0; j<ary.length; j++) {
                if (j === ary.length - 1) {
                    sTmp += ary[j];
                }else{
                    sTmp += ary[j] + oReplace[aryKey[j]];                                   // 还原中括号
                }
            }

            aryPattern[i] = sTmp;
        }

        sTmp = '^' + aryPattern.join('\\s?(.+?)\\s?') + '$';                                // 非贪婪模式匹配
        return new RegExp(sTmp);
    }

}());

