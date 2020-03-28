bus.on('整理章节', function (sheet, oSheet, contents){

    let oRoot = {};
    for (let i=0; i<contents.length; i++) {
        i = bus.at('整理子章节', oRoot, contents, i);
    }
    return oRoot;
});


bus.on('整理子章节', function (oParent, contents, index){

    !oParent.nodes && (oParent.nodes = []);

    let oSec;
    for (let i=index, oItem; oItem = contents[i++]; ) {

        oSec = {...oItem};
        oSec.values && (oSec.Seq = bus.at('章节编号', oSec.values[0]));

        // 找到父章节，并添加为父章节的子章节
        let oSuper = oParent;
        let iColSec, iColParent;
        while (oSuper) {

            if ( !oSuper.parent ) {
                oSec.parent = ()=>oSuper;
                oSuper.nodes.push(oSec);                                                                // 根节点了，直接添加为子章节
                break;
            }

            if ( oSuper.table ) {
                oSuper = oSuper.parent();
                continue;                                                                               // 表格没有子章节，继续找上级章节
            }
            if ( oSec.table ) {
                oSec.parent = ()=>oSuper;
                oSuper.nodes.push(oSec);                                                                // 如果是表格，直接按子章节处理
                break;
            }

            if ( oSec.Seq && oSuper.Seq ) {
                if ( oSec.Seq.seq.length > oSuper.Seq.seq.length ) {                                    // 章节号更深，按子章节处理
                    oSec.parent = ()=>oSuper;
                    oSuper.nodes.push(oSec);
                    break;
                }else if ( oSec.Seq.seq.length === oSuper.Seq.seq.length ) {                            // 章节号同级，继续找上级章节
                    oSuper = oSuper.parent();
                    continue;
                }else {                                                                                 // 章节号更浅，还得再看看
                    if ( oSec.Seq.seq.length === 2 ) {

                        iColSec = bus.at('地址起始列数字', oSec.values[0].cell);
                        iColParent = bus.at('地址起始列数字', oSuper.values[0].cell);
                        if ( iColSec > iColParent ) {
                            oSec.parent = ()=>oSuper;
                            oSuper.nodes.push(oSec);                                                    // 缩进的单章节号，按子章节处理（如1-2下的缩进的1按1-2-1看待）
                            break;
                        }

                    }
                }

            }else{

                iColSec = bus.at('地址起始列数字', oSec.values[0].cell);
                iColParent = bus.at('地址起始列数字', oSuper.values[0].cell);
                if ( iColSec > iColParent ) {
                    oSec.parent = ()=>oSuper;
                    oSuper.nodes.push(oSec);                                                            // 没有章节号时，按缩进对齐方式判断是否子章节（比较首个单元格位置）
                    break;
                }

            }

            oSuper = oSuper.parent();                                                                   // 继续找上级章节
        }

        return bus.at('整理子章节', oSec, contents, i);                                                 // 继续按顺序整理
    }

});
