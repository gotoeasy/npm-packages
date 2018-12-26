import test from 'ava';
import Err from '.';

test('1 Err.cat', t => {

    function runCompute(){
        try{
            return div(1, 0);
        }catch(e){
            throw Err.cat('my error message', e);
        }
    }

    let index;
    try{
        runCompute();
    }catch(e){
        index = e.toString().indexOf('^');
    }

    t.is(index > 0, true);

});

test('2 Err.cat 无error对象', t => {

    function runCompute(){
        try{
            return div(1, 0);
        }catch(e){
            throw Err.cat('my error message', e.message);
        }
    }

    let index;
    try{
        runCompute();
    }catch(e){
        index = e.toString().indexOf('^');
    }

    t.is(index > 0, false);

});


test('3 new Err', t => {

    function runCompute(){
        try{
            return div(1, 0);
        }catch(e){
            throw new Err('my error message', e);
        }
    }

    let index;
    try{
        runCompute();
    }catch(e){
        index = e.toString().indexOf('^');
    }

    t.is(index > 0, true);

});

test('4 new Err 指定opts参数', t => {

    function runCompute(){
        try{
            return div(1, 0);
        }catch(e){
            throw new Err('my error message', e, {text:'123\n456\n7890', line:2, column:2});
        }
    }

    let index;
    try{
        runCompute();
    }catch(e){
        index = e.toString().indexOf('^');
    }

    t.is(index > 0, true);

});



test('5 new Err 指定opts参数', t => {

    function runCompute(){
        try{
            return div(1, 0);
        }catch(e){
            throw new Err('my error message', e, {text:'123\n456\n7890', start:7});
        }
    }

    let index;
    try{
        runCompute();
    }catch(e){
        index = e.toString().indexOf('^');
    }

    t.is(index > 0, true);

});


test('6 Err.cat 有error对象', t => {

    function runCompute(){
        try{
            new Error('err........')
        }catch(e){
            throw Err.cat('my error message', e, new Err());
        }
    }

    let index;
    try{
        runCompute();
    }catch(e){
        index = e.toString().indexOf('^');
    }

    t.is(index > 0, false);

});


test('7 Err.cat 不是error对象', t => {

    function runCompute(){
        try{
            throw 'err........';
        }catch(e){
            throw Err.cat('my error message', e);
        }
    }

    let index;
    try{
        runCompute();
    }catch(e){
        index = e.toString().indexOf('^');
    }

    t.is(index > 0, false);

});


test('8 多次Err.cat', t => {

    function runCompute(){
        try{
            throw new Error('err........')
        }catch(e){
            let xx = Err.cat('my error message', e, new Err());
            throw Err.cat('my error message22222', new Error('err1'),new Error('err2'), xx);
        }
    }

    let index;
    try{
        runCompute();
    }catch(e){
        index = e.toString().indexOf('^');
    }

    t.is(index > 0, true);

});



test('9 不存在的变量', t => {

    function runCompute(){
        try{
            aaa.bbb();
        }catch(e){
            throw  Err.cat('my error message', e);
        }
    }

    let index;
    try{
        runCompute();
    }catch(e){
        index = e.toString().indexOf('^');
    }

    t.is(index > 0, true);

});


test('10 特别边界', t => {

    function runCompute(){
        try{
            [].bbb();
        }catch(e){
            e.stack = '    at bbb (xxxx.js:207:7)\n' + e.stack;
            throw  Err.cat('my error message', e);
        }
    }

    let index;
    try{
        runCompute();
    }catch(e){
        index = e.toString().indexOf('^');
    }

    t.is(index > 0, true);

});


test('11 特别边界', t => {

    function runCompute(){
        try{
            [].bbb();
        }catch(e){
            e.stack = '    at bbb xxxx.js:207:7\n    at ./test.js:1:2\n' + e.stack;
            throw  Err.cat('my error message', e);
        }
    }

    let index;
    try{
        runCompute();
    }catch(e){
        index = e.toString().indexOf('^');
    }

    t.is(index > 0, true);

});









