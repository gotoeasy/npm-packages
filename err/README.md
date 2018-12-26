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


<br>

## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

