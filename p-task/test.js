import test from 'ava';
import PTask from '.';

test('任务可以缓存，多次调用不会重复执行', async t => {

    let ptask = (function(){
        let cnt = 0;
        return new PTask((resolve, reject, isBroken) => function(name){
            cnt++;
            resolve(cnt);
        });
    })()

    let p1 = ptask.start('param');
    let p2 = ptask.start('param');
    let p3 = ptask.start('param');

    t.is(await p1, 1);
    t.is(await p2, 1);
    t.is(await p2, 1);
});


test('任务可以取消', async t => {

    let ptask = (function(){
        let cnt = 0;
        return new PTask((resolve, reject, isBroken) => function(name){
            cnt++;
            resolve(cnt);
        });
    })()

    let p1 = ptask.start('param');
    let p2 = ptask.start('param');
    let p3 = ptask.cancel('param');

    let rs = false;
    try{
        rs = await p1;
    }catch(e){
        rs = e;
    }
    t.is(rs, 'canceled');

    rs = false;
    try{
        rs = await p2;
    }catch(e){
        rs = e;
    }
    t.is(rs, 'canceled');

    rs = false;
    try{
        rs = await p3;
    }catch(e){
        rs = e;
    }
    t.is(rs, 'canceled');

});


test('任务可以重新开始', async t => {

    let ptask = (function(){
        let cnt = 0;
        return new PTask((resolve, reject, isBroken) => function(name){
            cnt++;
            resolve(cnt);
        });
    })()

    let p1 = ptask.start('param');
    let p2 = ptask.cancel('param');
    let p3 = ptask.restart('param');

    let rs = false;
    try{
        rs = await p1;
    }catch(e){
        rs = e;
    }
    t.is(rs, 'canceled');

    rs = false;
    try{
        rs = await p2;
    }catch(e){
        rs = e;
    }
    t.is(rs, 'canceled');

    rs = false;
    try{
        rs = await p3;
    }catch(e){
        rs = e;
    }
    t.is(rs, 1);

});


test('任务多次重新开始，按最后一次处理', async t => {

    let ptask = (function(){
        let cnt = 0;
        return new PTask((resolve, reject, isBroken) => function(name){
            cnt++;
            resolve(cnt);
        });
    })()

    let p1 = ptask.restart('param');
    let p2 = ptask.restart('param');
    let p3 = ptask.restart('param');

    t.is(await p1, 1);
    t.is(await p2, 1);
    t.is(await p2, 1);

});


test('取消一个不存在的任务，返回undefined', async t => {

    let ptask = (function(){
        let cnt = 0;
        return new PTask((resolve, reject, isBroken) => function(name){
            cnt++;
            resolve(cnt);
        });
    })()

    let px = ptask.cancel('xxxxx');

    let rs = false;
    try{
        rs= await px;
    }catch(e){
        rs = e;
    }
    t.is(rs, undefined);

});


test('任务执行异常', async t => {

    let ptask = (function(){
        return new PTask((resolve, reject, isBroken) => function(name){
            throw new Error('error in task')
        });
    })()

    let p1 = ptask.start('param');

    let rs = false;
    try{
        rs= await p1;
    }catch(e){
        rs = e;
    }
    t.is(rs.message, 'error in task');

});
