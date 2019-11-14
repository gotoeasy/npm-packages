const bus = require('@gotoeasy/bus');
const postobject = require('@gotoeasy/postobject');


bus.on('编程插件', function(){
    
    // 根据Sheet名称识别Sheet类型（修订履历、页面布局、页面项目、详细处理、编辑、补足、、、、等等）
    return postobject.plugin(/**/__filename/**/, function(root, context){

        for (let i=0,oSheet; oSheet=context.Sheets[i++];  ){
            if ( oSheet.ignore ) continue;                                      // 跳过忽略的Sheet

            oSheet.type = getSheetType(oSheet.name);
        }
    });

}());

// SheetVersion : 修订履历
// SheetPageLayout : 页面布局
// SheetPageItems : 页面项目
// SheetProcess : 详细处理
// SheetEdit : 编辑明细
// SheetOther : 其他
function getSheetType(name){

    if ( /^(变更履历|修订履历|修订版本|版本|版本履历)$/.test(name)
        || /^(変更履歴|改訂履歴)$/.test(name) ) {
        return 'SheetVersion';
    }

    if ( /^(页面设计|页面布局|布局|页面)$/.test(name)
        || /^(画面仕様|画面レイアウト|画面|レイアウト)$/.test(name) ) {
        return 'SheetPageLayout';
    }

    if ( /^(页面项目|页面项目设计|页面项目明细|页面项目说明|项目说明)$/.test(name)
        || /^(画面アイテム|画面項目|画面アイテム说明|画面項目说明|画面詳細)$/.test(name) ) {
        return 'SheetPageItems';
    }

    if ( /^(详细处理|处理设计|处理说明)$/.test(name)
        || /^(処理仕様|詳細処理)$/.test(name) ) {
        return 'SheetProcess';
    }

    if ( /^编辑/.test(name)
        || /^編集/.test(name) ) {
        return 'SheetTableEdit';
    }


    // 其他
    return 'SheetOther';
}