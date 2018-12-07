# @gotoeasy/babel
使用固定配置让babel转译代码，简化满足特定需求：语法转译+按需添加兼容补丁
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/babel.svg)](https://www.npmjs.com/package/@gotoeasy/babel)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>
<br>



## Sample
```js
const babel = require('@gotoeasy/babel');

let code = `
    let fn = (...args) => args.includes('y') ? Promise.resolve(args) : Promise.reject(args);
`;

console.info(babel(code));

// 文件.browserslistrc配置为`chrome 60`时转译结果如下
/*
"use strict";

let fn = (...args) => args.includes('y') ? Promise.resolve(args) : Promise.reject(args);
*/

// 文件.browserslistrc配置为`ie 11`时转译结果如下
/*
"use strict";

require("core-js/modules/es6.promise");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

var fn = function fn() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.includes('y') ? Promise.resolve(args) : Promise.reject(args);
};
*/
```



## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

