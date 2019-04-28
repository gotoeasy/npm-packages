# `@gotoeasy/p-task`
一个基于Promise的任务处理器，带缓存、可取消、能重启
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/p-task.svg)](https://www.npmjs.com/package/@gotoeasy/p-task)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/gotoeasy/npm-packages/blob/master/LICENSE)
<br>
<br>

## Install
```
npm i @gotoeasy/p-task
```

## API
```js
// 通过参数区分是否同一任务
// 同一任务多次调用，缓存使用首次调用结果

const PTask = require('@gotoeasy/p-task');

let cnt = 0;

let ptask = new PTask((resolve, reject, isBroken) => function(name){
    cnt++;
    console.info(cnt, 'execute ...', name);
    resolve(cnt);
});

(async function(){
    let p1 = ptask.start('param');
    let p2 = ptask.start('param');
    let p3 = ptask.start('param');

    try{
        console.info('p1:', await p1);
    }catch(e){
        console.info('p1 error:', e);
    }
    try{
        console.info('p2:', await p2);
    }catch(e){
        console.info('p2 error:', e);
    }
    try{
        console.info('p3:', await p3);
    }catch(e){
        console.info('p3 error:', e);
    }

})();

// 1 'execute ...' 'param'
// p1: 1
// p2: 1
// p3: 1

```
<br>
<br>

```js
// 任务可以取消

const PTask = require('@gotoeasy/p-task');

let cnt = 0;

let ptask = new PTask((resolve, reject, isBroken) => function(name){
    cnt++;
    console.info(cnt, 'execute ...', name);
    resolve(cnt);
});

(async function(){
    let p1 = ptask.start('param');
    let p2 = ptask.start('param');
    let p3 = ptask.cancel('param'); // cancel

    try{
        console.info('p1:', await p1);
    }catch(e){
        console.info('p1 error:', e);
    }
    try{
        console.info('p2:', await p2);
    }catch(e){
        console.info('p2 error:', e);
    }
    try{
        console.info('p3:', await p3);
    }catch(e){
        console.info('p3 error:', e);
    }

})();

// p1 error: canceled
// p2 error: canceled
// p3 error: canceled

```
<br>
<br>

```js
// 任务可以重新开始
// 同一任务多次重新开始，未完成任务将使用末次调用结果

const PTask = require('@gotoeasy/p-task');

let cnt = 0;

let ptask = new PTask((resolve, reject, isBroken) => function(name){
    cnt++;
    console.info(cnt, 'execute ...', name);
    resolve(cnt);
});

(async function(){
    let p1 = ptask.start('param');
    let p2 = ptask.cancel('param');
    let p3 = ptask.restart('param');
    let p4 = ptask.restart('param');

    try{
        console.info('p1:', await p1);
    }catch(e){
        console.info('p1 error:', e);
    }
    try{
        console.info('p2:', await p2);
    }catch(e){
        console.info('p2 error:', e);
    }
    try{
        console.info('p3:', await p3);
    }catch(e){
        console.info('p3 error:', e);
    }
    try{
        console.info('p4:', await p4);
    }catch(e){
        console.info('p4 error:', e);
    }

    let p5 = ptask.start('param');
    try{
        console.info('p5:', await p5);
    }catch(e){
        console.info('p5 error:', e);
    }

    let p6 = ptask.restart('param');
    try{
        console.info('p6:', await p6);
    }catch(e){
        console.info('p6 error:', e);
    }

})();


// p1 error: canceled
// p2 error: canceled
// 1 'execute ...' 'param'
// p3: 1
// p4: 1
// p5: 1
// 2 'execute ...' 'param'
// p6: 2

```
<br>
<br>

## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

