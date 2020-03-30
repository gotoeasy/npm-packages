const pattern = [];
pattern.push({type: 'Return', reg: /^(?:返回)(?:[:：]+)(.+)(?:[．.。]?)$/});   // 返回:NNNNNNNNNN

module.exports = pattern;
