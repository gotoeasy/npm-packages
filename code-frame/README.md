# `@gotoeasy/code-frame`
code-frame
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/code-frame.svg)](https://www.npmjs.com/package/@gotoeasy/code-frame)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
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

start = 12;
result = codeframe({text, start});
console.log(result);
```
<br>

## Sample 2
```js
start = 12;
end = 15;
result = codeframe({text, start, end});
console.log(result);
```

<br>
<br>

## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

