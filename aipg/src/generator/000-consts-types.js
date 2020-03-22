// 节点类型定义
const Types = {
    Var                     : 'Var',                            // 变量
    Literal                 : 'Literal',                        // 常数
    Break                   : 'Break',                          // break
    Continue                : 'Continue',                       // continue
    Return                  : 'Return',                         // return
    If                      : 'If',                             // if
    GreaterThan             : 'GreaterThan',                    // 大于
    GreaterEqualThan        : 'GreaterEqualThan',               // 大于等于
    LessThan                : 'LessThan',                       // 小于
    LessEqualThan           : 'LessEqualThan',                  // 小于等于
    Equal                   : 'Equal',                          // 等于
    ExactEqual              : 'ExactEqual',                     // 严格等于
    And                     : 'And',                            // 并且
    Or                      : 'Or',                             // 或者
    Add                     : 'Add',                            // 加
    Subtract                : 'Subtract',                       // 减
    Multiply                : 'Multiply',                       // 乘
    Divide                  : 'Divide',                         // 除
    Condition               : 'Condition',                      // 条件
    Body                    : 'Body',                           // 内容
};
