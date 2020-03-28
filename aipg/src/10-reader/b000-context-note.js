// context数据结构说明
 /*
    context.input                                       // 存放输入对象信息
    context.input.file                                  // 输入文件
    context.input.hashcode                              // 输入文件的哈希码
    context.result                                      // 存放结果对象信息

    context.workbook                                    // 存放Excel的workbook对象
    context.Sheets[]                                    // 存放Excel的Sheet对象信息数组
    context.Sheets[].name                               // Sheet名
    context.Sheets[].hidden                             // Sheet是否隐藏
    context.Sheets[].ignore                             // Sheet是否要忽略
    context.Sheets[].type                               // Sheet类型【SheetType】
    context.Sheets[].mapMergeCell                       // 所有合并单元格的地址信息，如 Map{'A1': {addr: 'A1:C2', startRow:1, endRow:2, startColumn:1, endColumn:3}}
    context.Sheets[].maxColumn                          // Sheet最大列
    context.Sheets[].maxRow                             // Sheet最大行
    context.Sheets[].maxHeadColumn                      // Sheet头部最大行
    context.Sheets[].maxHeadRow                         // Sheet头部最大列

*/
