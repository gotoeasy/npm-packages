// 节点类型定义
const Types = {
    Add                     : 'Add',                            // +
    And                     : 'And',                            // &&
    Body                    : 'Body',                           // 内容
    Break                   : 'Break',                          // break
    Continue                : 'Continue',                       // continue
    Call                    : 'Call',                           // 调用
    Condition               : 'Condition',                      // 条件
    Divide                  : 'Divide',                         // /
    Excel                   : 'Excel',                          // Excel
    Equal                   : 'Equal',                          // =
    Equals                  : 'Equals',                         // ==
    ExactEquals             : 'ExactEquals',                    // ===
    ElseIf                  : 'ElseIf',                         // else if
    Else                    : 'Else',                           // else
    GreaterThan             : 'GreaterThan',                    // >
    GreaterEqualsThan       : 'GreaterEqualsThan',              // >=
    Integer                 : 'Integer',                        // Integer
    IfElseStatement         : 'IfElseStatement',                // IfElse语句
    If                      : 'If',                             // if
    Literal                 : 'Literal',                        // Literal
    LessThan                : 'LessThan',                       // <
    LessEqualsThan          : 'LessEqualsThan',                 // <=
    LeftAddAdd              : 'LeftAddAdd',                     // ++i
    LeftSubtractSubtract    : 'LeftSubtractSubtract',           // --i
    MatchSections           : 'MatchSections',                  // 段落匹配数组
    MatchSection            : 'MatchSection',                   // 单个段落匹配
    Method                  : 'Method',                         // 方法
    MethodNote              : 'MethodNote',                     // 方法的说明
    MutilMatch              : 'MutilMatch',                     // MutilMatch
    Multiply                : 'Multiply',                       // *
    Number                  : 'Number',                         // 数值
    Note                    : 'Note',                           // 说明性文字

    Or                      : 'Or',                             // ||
    Parameter               : 'Parameter',                      // Parameter
    Root                    : 'root',                           // 根节点类型
    Return                  : 'Return',                         // Return
    RightAddAdd             : 'RightAddAdd',                    // i++
    RightSubtractSubtract   : 'RightSubtractSubtract',          // i--
    Sheet                   : 'Sheet',                          // Sheet
    SheetVersion            : 'SheetVersion',                   // 修订履历
    SheetPageLayout         : 'SheetPageLayout',                // 页面布局
    SheetPageItems          : 'SheetPageItems',                 // 页面项目
    SheetProcess            : 'SheetProcess',                   // 详细处理
    SheetEdit               : 'SheetEdit',                      // 编辑明细
    SheetOther              : 'SheetOther',                     // 其他
    SheetHead               : 'SheetHead',                      // 头部
    SheetSection            : 'SheetSection',                   // 章节
    String                  : 'String',                         // String
    Statement               : 'Statement',                      // 语句
    Subtract                : 'Subtract',                       // -
    Unknown                 : 'Unknown',                        // Unknown
    UnMatch                 : 'UnMatch',                        // UnMatch
    Var                     : 'Var',                            // 变量
};

Object.freeze(Types);
module.exports = Types;
