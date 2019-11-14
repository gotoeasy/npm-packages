const bus = require('@gotoeasy/bus');

// 工具函数
bus.on('空白', function (val){
    return !val || /^\s*$/.test(val);
});
bus.on('非空白', function (val){
    return !bus.at('空白', val);
});

