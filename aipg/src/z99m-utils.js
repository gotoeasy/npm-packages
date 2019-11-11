const bus = require('@gotoeasy/bus');

// 工具函数
bus.on('isBlank', function (val){
    return !val || /^\s*$/.test(val);
});
bus.on('isNotBlank', function (val){
    return !bus.at('isBlank', val);
});

