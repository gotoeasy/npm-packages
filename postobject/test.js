import test from 'ava';
import postobject from '.';

test('11 3层节点的toJson', async t => {

    let plugin0 = async function(root, result){
        result.json = root.toJson();
    };

    let pluginlog = async function(root, result){
//        console.info('-----------root----------', root);
//        console.info('-----------JSON----------');
//        console.info(JSON.stringify(root.toJson(),null,4));
    };


    let rs = await postobject([plugin0, pluginlog]).process({lay:1,nodes:[{lay:2,nodes:[{lay:3}]}]})
    t.is(JSON.stringify(rs.json), '{"type":"root","nodes":[{"type":"Unknown","object":{"lay":1},"nodes":[{"type":"Unknown","object":{"lay":2},"nodes":[{"type":"Unknown","object":{"lay":3}}]}]}]}');

});

test('10 单节点的toJson', async t => {

    let plugin0 = async function(root, result){
    };

    let plugin1 = async function(root, result){
        result.json = root.toJson();
    };

    let rs = await postobject([plugin0, plugin1]).process({})
    t.is(JSON.stringify(rs.json), '{"type":"root","nodes":[{"type":"Unknown","object":{}}]}');

});

test('09 单纯根节点的toJson', async t => {

    let plugin0 = async function(root, result){
    };

    let plugin1 = async function(root, result){
        result.json = root.toJson();
    };

    let rs = await postobject([plugin0, plugin1]).process()
    t.is(JSON.stringify(rs.json), '{"type":"root"}');

});



test('08 三个插件，一个添加节点和删除指定子节点，一个替换指定节点，一个计算总和', async t => {

    let plugin0 = async function(root, result){
        await root.walk(/num/, (node, object) => {
            if ( object.value === 1 ) {
                let oNode = node.clone();
                oNode.object.value = 10;
                oNode.removeAll();
                node.before(oNode);
                
                oNode = oNode.clone();
                oNode.object.value = 20;
                node.after(oNode);

                let child = node.getFirstChild();
                node.removeChild(child);
            }
        });
    };
    let plugin1 = async function(root, result){
        await root.walk((node, object) => {
            if ( object.value === 10 ) {
                let oNode = node.clone();
                oNode.object.value = 100;
                oNode.removeAll();
                node.replaceWith(oNode);
            }
        });
    };
    let plugin2 = async function(root, result){
        result.total = result.total || 0;
        await root.walk('num', (node, object) => {
            result.total += object.value;
        });
    };

    let rs = await postobject([plugin0, plugin1, plugin2]).process({type:'num', value:1, nodes:[{type:'num', value:2},{type:'num', value:3}]})

    t.is(rs.total, 124);

});

test('07 三个插件，一个添加节点和删除指定子节点，一个删除指定节点，一个计算总和', async t => {

    let plugin0 = async function(root, result){
        await root.walk(/num/, (node, object) => {
            if ( object.value === 1 ) {
                let oNode = node.clone();
                oNode.object.value = 10;
                oNode.removeAll();
                node.before(oNode);
                
                oNode = oNode.clone();
                oNode.object.value = 20;
                node.after(oNode);

                let child = node.getFirstChild();
                node.removeChild(child);
            }
        });
    };
    let plugin1 = async function(root, result){
        await root.walk((node, object) => {
            object.value === 10 && node.remove();
        });
    };
    let plugin2 = async function(root, result){
        result.total = result.total || 0;
        await root.walk('num', (node, object) => {
            result.total += object.value;
        });
    };

    let rs = await postobject([plugin0, plugin1, plugin2]).process({type:'num', value:1, nodes:[{type:'num', value:2},{type:'num', value:3}]})

    t.is(rs.total, 24);

});


test('06 三个插件，一个添加节点和删除指定子节点，一个删除指定节点，一个计算总和', async t => {

    let plugin0 = async function(root, result){
        await root.walk(/num/, (node, object) => {
            if ( object.value === 1 ) {
                let oNode = node.clone();
                oNode.object.value = 10;
                oNode.removeAll();
                node.before(oNode);
                
                oNode = oNode.clone();
                oNode.object.value = 20;
                node.after(oNode);

                node.removeChild(node.getLastChild());
            }
        });
    };
    let plugin1 = async function(root, result){
        await root.walk((node, object) => {
            object.value === 10 && node.remove();
        });
    };
    let plugin2 = async function(root, result){
        result.total = result.total || 0;
        await root.walk('num', (node, object) => {
            result.total += object.value;
        });
    };

    let rs = await postobject([plugin0, plugin1, plugin2]).process({type:'num', value:1, nodes:[{type:'num', value:2},{type:'num', value:3}]})

    t.is(rs.total, 23);

});


test('05 三个插件，一个添加节点，一个删除子节点，一个计算总和', async t => {

    let plugin0 = async function(root, result){
        await root.walk(/num/, (node, object) => {
            if ( object.value === 1 ) {
                let oNode = node.clone();
                oNode.object.value = 10;
                oNode.removeAll();
                node.before(oNode);
                
                oNode = oNode.clone();
                oNode.object.value = 20;
                node.after(oNode);

                node.removeAll();
            }
        });
    };
    let plugin1 = async function(root, result){
        await root.walk((node, object) => {
            object.value === 3 && node.remove();
        });
    };
    let plugin2 = async function(root, result){
        result.total = result.total || 0;
        await root.walk('num', (node, object) => {
            result.total += object.value;
        });
    };

    let rs = await postobject([plugin0, plugin1, plugin2]).process({type:'num', value:1, nodes:[{type:'num', value:2},{type:'num', value:3}]})

    t.is(rs.total, 31);

});

test('04 四个插件，一个添加节点，一个删除节点，一个计算总和，最后一个注释空转', async t => {

    let plugin0 = async function(root, result){
        await root.walk(/num/, (node, object) => {
            if ( object.value === 1 ) {
                let oNode = node.clone();
                oNode.object.value = 10;
                oNode.removeAll();
                node.before(oNode);
                
                oNode = oNode.clone();
                oNode.object.value = 20;
                node.after(oNode);
            }
            if ( object.value === 3 ) {
                let oNode = node.clone();
                oNode.type = 'comment';
                oNode.object.value = 'first comment';
                oNode.removeAll();
                node.first(oNode);
                
                oNode = oNode.clone();
                oNode.object.value = 'last comment';
                node.last(oNode);
            }
        });
    };
    let plugin1 = async function(root, result){
        await root.walk((node, object) => {
            object.value === 3 && node.remove();
        });
    };
    let plugin2 = async function(root, result){
        result.total = result.total || 0;
        await root.walk('num', (node, object) => {
            result.total += object.value;
        });
    };
    let pluginlog = async function(root, result){
  //      console.info('-----------root----------', root);
  //      console.info('-----------JSON----------');
  //      console.info(JSON.stringify(root.toJson(),null,4));
    };

    let rs = await postobject([plugin0,plugin1, plugin2,pluginlog]).process({type:'num', value:1, nodes:[{type:'num', value:2},{type:'num', value:3}]})

    t.is(rs.total, 33);

});


test('03 两个插件，一个删除节点，最后计算总和', async t => {

    let plugin1 = async function(root, result){
        await root.walk((node, object) => {
            object.value > 2 && node.remove();
        });
    };
    let plugin2 = async function(root, result){
        result.total = result.total || 0;
        await root.walk('num', (node, object) => {
            result.total += object.value;
        });
    };

    let rs = await postobject([plugin1, plugin2]).process({type:'num', value:1, nodes:[{type:'num', value:2},{type:'num', value:3}]})

    t.is(rs.total, 3);

});

test('02 两个插件，一个乘2，最后计算总和', async t => {

    let plugin1 = async function(root, result){
        await root.walk('num', (node, object) => {
            object.value *= 2;
        });
    };
    let plugin2 = async function(root, result){
        result.total = result.total || 0;
        await root.walk('num', (node, object) => {
            result.total += object.value;
        });
    };

    let rs = await postobject([plugin1, plugin2]).process({type:'num', value:1, nodes:[{type:'num', value:2},{type:'num', value:3}]})

    t.is(rs.total, 12);

});

test('01 一个插件，计算总和', async t => {

    let plugin1 = async function(root, result){
        result.total = result.total || 0;
        await root.walk('num', (node, object) => {
            result.total += object.value;
        });
    };

    let rs = await postobject([plugin1]).process({type:'num', value:1, nodes:[{type:'num', value:2},{type:'num', value:3}]})

    t.is(rs.total, 6);

});

