# `@gotoeasy/code-frame`
code-frame
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/code-frame.svg)](https://www.npmjs.com/package/@gotoeasy/code-frame)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/gotoeasy/npm-packages/blob/master/LICENSE)
<br>
<br>

## Install
```
npm i @gotoeasy/code-frame
```

## Sample 1
```js
const codeframe = require('@gotoeasy/code-frame');

let file, text, start, end, result;

text = `123456781
123456782
123456783
123456784
123456785
123456786
123456787
123456788
123456789
123456780
123456781
123456782
123456783
`;

start = 11;
result = codeframe({text, start, linesAbove: 3, linesBelow: 3});
console.log(result);
```
![Sample1](https://github.com/gotoeasy/npm-packages/blob/master/code-frame/img/img1.png)
<br>

## Sample 2
```js
start = 11;
end = 15;
result = codeframe({text, start, end, linesAbove: 3, linesBelow: 3});
console.log(result);
```
![Sample2](https://github.com/gotoeasy/npm-packages/blob/master/code-frame/img/img2.png)
<br>

## Sample 3
```js
start = 11;
end = 45;
result = codeframe({text, start, end, linesAbove: 3, linesBelow: 3});
console.log(result);
```
![Sample3](https://github.com/gotoeasy/npm-packages/blob/master/code-frame/img/img3.png)
<br>

## Sample 4
```js
file = './testdata.txt';
start = 11;
end = 45;
result = codeframe({file, start, end, linesAbove: 3, linesBelow: 3});
console.log(result);
```
![Sample4](https://github.com/gotoeasy/npm-packages/blob/master/code-frame/img/img3.png)
<br>

## Sample 5
```js
line = 1;
column = 1;
result = codeframe({text, line, column, linesAbove: 3, linesBelow: 3});
console.log(result);
```
![Sample5](https://github.com/gotoeasy/npm-packages/blob/master/code-frame/img/img1.png)
<br>

## Sample 6
```js
file = './testdata.txt';
line = 1;
column = 1;
result = codeframe({file, line, column, linesAbove: 3, linesBelow: 3});
console.log(result);
```
![Sample6](https://github.com/gotoeasy/npm-packages/blob/master/code-frame/img/img1.png)
<br>

## Sample 7
```js
startLine = 1;
startColumn = 1;
endLine = 4;
endColumn = 5;
result = codeframe({text, startLine, startColumn, endLine, endColumn, linesAbove: 3, linesBelow: 3});
console.log(result);
```
![Sample7](https://github.com/gotoeasy/npm-packages/blob/master/code-frame/img/img3.png)
<br>

## Sample 8
```js
file = './testdata.txt';
startLine = 1;
startColumn = 1;
endLine = 4;
endColumn = 5;
result = codeframe({file, startLine, startColumn, endLine, endColumn, linesAbove: 3, linesBelow: 3});
console.log(result);
```
![Sample8](https://github.com/gotoeasy/npm-packages/blob/master/code-frame/img/img3.png)
<br>

## Sample 9
```js
text = '111111111122222222223333333333444444444455555555556666666666';
start = 30;
end   = 33;
maxLength = 50;      // 调整每行最大显示长度，默认maxLength=120
result = codeframe({text, start, end, maxLength, linesAbove: 3, linesBelow: 3});
console.log(result); // 超出部分省略号表示
```
![Sample9](https://github.com/gotoeasy/npm-packages/blob/master/code-frame/img/img9.png)
<br>

## Sample 10
```js
text = '                              444444444455555555556666666666';
start = 30;
end   = 33;
maxLength = 50;
result = codeframe({text, start, end, maxLength, linesAbove: 3, linesBelow: 3});
console.log(result); // 左缩进空白将适当去除
```
![Sample10](https://github.com/gotoeasy/npm-packages/blob/master/code-frame/img/img10.png)
<br>

<br>

## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

