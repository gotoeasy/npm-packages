// 根据Sheet名判断Sheet类型
bus.on('Sheet类型', function (name){

    if ( /^(变更履历|修订履历|修订版本|版本|版本履历)$/.test(name)
        || /^(変更履歴|改訂履歴)$/.test(name) ) {
        return SheetType.SheetVersion;
    }

    if ( /^(页面设计|页面布局|布局|页面)$/.test(name)
        || /^(画面仕様|画面レイアウト|画面|レイアウト)$/.test(name) ) {
        return SheetType.SheetPageLayout;
    }

    if ( /^(页面项目|页面项目设计|页面项目明细|页面项目说明|项目说明)$/.test(name)
        || /^(画面アイテム|画面項目|画面アイテム说明|画面項目说明|画面詳細)$/.test(name) ) {
        return SheetType.SheetPageItems;
    }

    if ( /^(详细处理|处理设计|处理说明)$/.test(name)
        || /^(処理仕様|詳細処理)$/.test(name) ) {
        return SheetType.SheetProcess;
    }

    if ( /^编辑/.test(name)
        || /^編集/.test(name) ) {
        return SheetType.SheetEdit;
    }


    // 其他
    return SheetType.SheetOther;
});
