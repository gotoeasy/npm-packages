# `@gotoeasy/err`
一个用于node环境的Error子类，提供更丰富的构造参数接口，更友好的code-frame提示，消息拼接等功能，详见Sample截图
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/err.svg)](https://www.npmjs.com/package/@gotoeasy/err)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>
<br>

## Install
```
npm i @gotoeasy/err
```

## Sample 1
```js
// z.js
const codeframe = require('@gotoeasy/err');

function runCompute(){
    try{
        let div = require('./test-divxxxxxxxxxxxxxxx');
        return div(1, 0);
    }catch(e){
        throw Err.cat('my error message', e);
    }
}

try{
    runCompute();
}catch(e){
    console.error(e.toString());
}
```
![Sample1](https://github.com/gotoeasy/npm-packages/blob/master/err/img/img1.png)
<br>

## Sample 2
```js
// test-div.js
module.exports = (a, b) => {
    if ( b === 0 ) {
        throw new Error('invalid parameter (b=0)')
    }
    return a/b;
};
```
```js
// z.js
const codeframe = require('@gotoeasy/err');

function runCompute(){
    try{
        let div = require('./test-div');
        return div(1, 0);
    }catch(e){
        throw Err.cat('my error message', e);
    }
}

try{
    runCompute();
}catch(e){
    console.error(e.toString());
}
```
![Sample2](https://github.com/gotoeasy/npm-packages/blob/master/err/img/img2.png)
<br>

## Sample 3
```js
// z.js
const codeframe = require('@gotoeasy/err');

function runCompute(){
    try{
        return div(1, 0);
    }catch(e){
        throw new Err('my error message', e);
    }
}

try{
    runCompute();
}catch(e){
    console.error(e.toString());
}
```
![Sample3](https://github.com/gotoeasy/npm-packages/blob/master/err/img/img3.png)
<br>

## Sample 4
```js
// z.js
const codeframe = require('@gotoeasy/err');

function runCompute(){
    try{
        return div(1, 0);
    }catch(e){
        throw Err.cat('my message 11111', 'file=z.js', e, new Err('err message'));
    }
}

try{
    runCompute();
}catch(e){
    console.error(e.toString());
}
```
![Sample4](https://github.com/gotoeasy/npm-packages/blob/master/err/img/img4.png)
<br>

## Sample 5
```js
// z.js
const codeframe = require('@gotoeasy/err');

function runCompute(){
    try{
        return div.exec(1, 0);
    }catch(e){
        throw Err.cat('my error message', e);
    }
}

try{
    runCompute();
}catch(e){
    console.error(e.toString());
}
```
![Sample5](https://github.com/gotoeasy/npm-packages/blob/master/err/img/img5.png)
<br>

## Sample 6
```js
// z.js
const codeframe = require('@gotoeasy/err');

function runCompute(){
    try{
        throw new Error('test');
    }catch(e){
        throw new Err('my message1', 'file=./test.js', e, {file:'./test.js', line:74, column:51});
    }
}

try{
    runCompute();
}catch(e){
    console.error(e.toString());
}
```
![Sample6](https://github.com/gotoeasy/npm-packages/blob/master/err/img/img6.png)
<br>



## Err对象构造函数，提供更丰富的参数接口
* 参数分message、error对象、options选项，数量不限，顺序随意
* message参数有多个的话会被按顺序拼接，且第一个message作为异常对象的消息
* error对象有多个的时候，仅最后一个有效，其stack会被拼接作为toString返回内容的一部分
* options对象有多个的时候，仅最后一个有效，作用是自定义生成code-frame内容

<br>


## Err.cat方法，主要用于编辑追加error对象的错误信息
* 参数分message、error对象数量不限，顺序随意
* message参数有多个的话会被按顺序拼接
* error对象有多个的时候，stack会被按顺序拼接作为toString返回内容的一部分
* 返回参数中最后一个error对象

<br>
<br>

## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

