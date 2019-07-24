const File = require('@gotoeasy/file');
const event = require('../event');


module.exports = event.on('统计文件行数', function(){

	return (file, project) => {
		let result = {total: 0, blank: 0, comment: 0, code: 0, file:file}

        if ( /.btf$/i.test(file) ) {

            let text = File.read(file);
            let oBtf = event.at('BTF文件内容解析', text);
            countBtf(result, oBtf);

        }else if ( /.rpose$/i.test(file) ) {

            let text = File.read(file);
            let oBtf = event.at('BTF文件内容解析', text);
            countRpose(result, oBtf);

        }else if ( /.skill$/i.test(file) ) {

            let text = File.read(file);
            let oBtf = event.at('BTF文件内容解析', text);
            countRpose(result, oBtf);

        }else{

            let oFlg = {isBlockCommentStart: false}, ext = getFileExt(file);
            let lines = File.read(file).split('\n').map(s=>s.trim());

            for ( let i=0; i<lines.length; i++ ) {
                countLine(ext, lines[i], result, oFlg);
            }

        }

        result.total && event.at('统计项目行数')[project].list.push(result);

		return result;
	};


}());

function countByExt(texts=[], ext){

    let result = {total: 0, blank: 0, comment: 0, code: 0}
    let oFlg = {isBlockCommentStart: false};
    let lines = texts.map(s=>s.trim());

    for ( let i=0; i<lines.length; i++ ) {
        countLine(ext, lines[i], result, oFlg);
    }

    return result;
}


function countRpose(oRs, oBtf){
    // oRs: {total: 0, blank: 0, comment: 0, code: 0}
    // oBtf: {blank: nnn, comment: nnn, docs: [...]}
    oRs.blank = oBtf.blank;
    oRs.comment = oBtf.comment;

    let rblocks = oBtf.docs[0] || [];

    for ( let i=0,blocks; blocks=oBtf.docs[i++]; ) {
        if ( i < 2 ) {
            blocks.forEach(block => {
                oRs.code++;                                             // 块名行算一行代码
                if ( /^(api|mount)$/i.test(block.name) ) {
                    block.texts.forEach(line => {
                        line.trim() ? (oRs.code++) : (oRs.blank++);
                    })
                }else{
                    let ext = '';
                    /^view$/i.test(block.name) && (ext = 'html');
                    /^methods$/i.test(block.name) && (ext = 'js');
                    /^(sass|scss)$/i.test(block.name) && (ext = 'sass');
                    /^less$/i.test(block.name) && (ext = 'less');
                    /^css$/i.test(block.name) && (ext = 'css');

                    let result = countByExt(block.texts, ext);
                    oRs.blank += result.blank;
                    oRs.comment += result.comment;
                    oRs.code += result.code;
                }
            });
        }else{
            // 忽略的文档，按注释及空行统计
            blocks.forEach(block => {
                oRs.comment++;
                block.texts.forEach(line => {
                    line.trim() ? (oRs.comment++) : (oRs.blank++);
                })
            });
        }
    }

    oRs.total = oRs.blank + oRs.comment + oRs.code;
}


function countSkill(oRs, oBtf){
    // oRs: {total: 0, blank: 0, comment: 0, code: 0}
    // oBtf: {blank: nnn, comment: nnn, docs: [...]}
    oRs.blank = oBtf.blank;
    oRs.comment = oBtf.comment;

    let rblocks = oBtf.docs[0] || [];

    for ( let i=0,blocks; blocks=oBtf.docs[i++]; ) {
        if ( i < 2 ) {
            blocks.forEach(block => {
                oRs.code++;                                             // 块名行算一行代码
                if ( /^function$/i.test(block.name) ) {
                    let result = countByExt(block.texts, 'js');
                    oRs.blank += result.blank;
                    oRs.comment += result.comment;
                    oRs.code += result.code;
                }else{
                    block.texts.forEach(line => {
                        line.trim() ? (oRs.code++) : (oRs.blank++);
                    })
                }
            });
        }else{
            // 忽略的文档，按注释及空行统计
            blocks.forEach(block => {
                oRs.comment++;
                block.texts.forEach(line => {
                    line.trim() ? (oRs.comment++) : (oRs.blank++);
                })
            });
        }
    }

    oRs.total = oRs.blank + oRs.comment + oRs.code;
}



function countBtf(oRs, oBtf){
    // oRs: {total: 0, blank: 0, comment: 0, code: 0, file:file}
    // oBtf: {blank: nnn, comment: nnn, docs: [...]}
    oRs.blank = oBtf.blank;
    oRs.comment = oBtf.comment;

    oBtf.docs.forEach(blocks => {
        blocks.forEach(block => {
            oRs.code++;                                         // 块名行算一行代码
            block.texts.forEach(line => {
                line.trim() ? (oRs.code++) : (oRs.blank++);
            })
        });
    });

    oRs.total = oRs.blank + oRs.comment + oRs.code;
}



function countLine(ext, line, result, oFlg){

	!oFlg.isBlockCommentStart && (oFlg.isBlockCommentStart = isBlockCommentStart(ext, line));

	result.total++;
	if ( line == '' ) {
		result.blank++;
	} else if ( oFlg.isBlockCommentStart || isLineComment(ext, line) ) {
		result.comment++;
	} else {
		result.code++;
	}

	(oFlg.isBlockCommentStart && isBlockCommentEnd(ext, line)) && (oFlg.isBlockCommentStart = false);
}

function isLineComment(ext, line){
	return event.at('注释判断', ext, line, 0);
}

function isBlockCommentStart(ext, line){
	return event.at('注释判断', ext, line, 10);
}

function isBlockCommentEnd(ext, line){
	return event.at('注释判断', ext, line, 11);
}

function getFileExt(file){
	let name = file.substring(file.lastIndexOf('/')+1);
	return name.indexOf('.') >=0 ? name.substring(name.lastIndexOf('.')+1) : '';
}