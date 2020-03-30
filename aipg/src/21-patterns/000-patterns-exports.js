const patterns = [];
module.exports = patterns;

patterns.push({type: 'Return', regexp: /^(?:返回)\s*(?:[:：]+)(.+)(?:[．.。]?)$/});   // 返回:NNNNNNNNNN
patterns.push({type: 'Add', regexp: /^(.+)(?:[+＋]+)(.+)$/});   // NNN + NNN
patterns.push({type: 'String', regexp: /^(?:“)(.*)(?:”)$/});   // “NNNNNN”
