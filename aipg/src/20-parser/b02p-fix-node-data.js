bus.on('解析器插件', function(){
    
    // 整理章节内容
    return postobject.plugin(/**/__filename/**/, async function(root, context){

        await root.walk( Types.SheetSection, (node, object) => {

            // cell
            object.cell = object.values[0].cell;                                // 起始单元格

            // value
            let ary = [];
            object.values.forEach(oVal => ary.push(oVal.value));
            object.value = ary.join('\t');                                      // 拼接后的段句
            if (object.Seq) {
                object.value = object.value.substring(object.Seq.orig).trim();  // 去除章节号
            }
            object.value = object.value.replace(/^[,，、.．、，]*\s*/, '');      // 去除左边的标点符号空白

            // seq
            object.seq = object.Seq ? object.Seq.seq : null;                    // 段句的章节号

            delete object.Seq;
            delete object.values;

        }, {readonly: true});

    });

}());

