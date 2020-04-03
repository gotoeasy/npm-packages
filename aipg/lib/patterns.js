const patterns = [];
module.exports = patterns;

patterns.push({type: 'Return', regexp: /^(?:返回)\s*(?:[:：]+)(.+)(?:[．.。]?)$/});   // 返回:NNNNNNNNNN
patterns.push({type: 'Add', regexp: /^(.+)(?:[+＋]+)(.+)$/});   // NNN + NNN
patterns.push({type: 'String', regexp: /^(?:“)(.*)(?:”)$/, leaf: true});   // “NNNNNN”

patterns.push({type: 'Note', regexp: /^(.*)(?:服务)(?:[.。．]?)$/, leaf: true});   // “NNNNNN服务”
patterns.push({type: 'ParameterOnlyOne', regexp: /^(参数)$/, leaf: true});   // “参数”
