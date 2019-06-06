const File = require('@gotoeasy/file');
const event = require('../event');

module.exports = event.on('BTF文件内容解析', function(){

    return function(text){
        let lines = text.split('\n');                                                                   // 行内容包含换行符
        return parse([], lines);
    };

}());


function parse(docs, lines) {

    let sLine;
    let blockStart = false, blockEnd = false, documentEnd = false;
    let blank = 0, comment = 0;
    let blocks = [], block = null;

    for ( let i=0; i<lines.length; i++ ) {
        sLine = lines[i];

        if ( isBlockStart(sLine) ) {
            // 当前是块名行 [nnn]
            let name = getBlockName(sLine);             // 块名
            let texts = [];                             // 块文本
            block = {name, texts};

            if ( documentEnd ) {
                // 切换文档后的第一行是块名行
                blocks = [];
                blocks.push(block);
            }else{
                if ( blockStart || blockEnd ) {
                    // 块文本途中遇见块名
                    blocks.push(block);
                }else{
                    // 文档注释途中遇见块名
                    blocks.push(block);
                }

            }
            !docs.includes(blocks) && docs.push(blocks);

            blockStart = true;
            blockEnd = false
            documentEnd = false;

        } else if ( isBlockEnd(sLine) ) {
            // 当前是块结束行 ---------
            comment++; // 累计注释行

            if ( !documentEnd && blockStart ) {
                // 文本块途中遇块结束行
                block = null;
                blockStart = false;
                blockEnd = true
            }

            documentEnd = false;

        } else if ( isDocumentEnd(sLine) ) {
            // 当前是文档结束行 =========
            comment++; // 累计注释行
            blocks = [];
            //blocks && blocks.length && !docs.includes(blocks) && docs.push(blocks);

            blockStart = false;
            blockEnd = false;
            documentEnd = true;

        } else {

            if ( !documentEnd && blockStart && !blockEnd ) {
                // 当前是块内容行，处理转义字符后，拼接当前Block内容
                if ( sLine.charAt(0) === '\\' && (/^\\+\[.*\]/.test(sLine) || /^\\+---------/.test(sLine) || /^\\+=========/.test(sLine)) ) {
                    block.texts.push( sLine.substring(1) );
                }else{
                    block.texts.push( sLine );
                }
            }else{
                // 当前是忽略的注释行
                sLine.trim() ? (comment++) : (blank++);  // 累计空行或注释行
            }

            documentEnd = false;
        }

    }

    return {docs, blank, comment};
}

function isBlockStart(sLine) {
    return sLine.startsWith('[') && sLine.indexOf(']') > 0;
}

function isBlockEnd(sLine) {
    return sLine.startsWith('---------');
}

function isDocumentEnd(sLine) {
    return sLine.startsWith('=========');
}

function getBlockName(sLine) {
    let name;
    for ( let i=1; i<sLine.length; i++) {
        if ( sLine.charAt(i-1) !== '\\' && sLine.charAt(i) === ']' ) {
            name = sLine.substring(1, i).toLowerCase();
            name = name.replace(/\\\]/g, ']');                              // 名称部分转义 [\]] => ]; 
            return name;
        }
    }

    name = sLine.substring(1, sLine.lastIndexOf(']')).toLowerCase();
    name = name.replace(/\\\]/g, ']');                                      // 最后一个]忽略转义 [\] => \; [\]\] => ]\
    return name;
}
