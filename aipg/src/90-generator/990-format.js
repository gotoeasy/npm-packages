gen.on('格式化代码', function (src, opts={}){
    try{
        return require('@gotoeasy/csjs').formatJava(src, opts);
    }catch(e){
        console.error('format java src failed', e);
        return src;
    }
});
