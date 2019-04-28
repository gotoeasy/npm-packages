# @gotoeasy/browserify
使用固定配置让browserify转译代码，简化满足特定需求：把含require的代码转成能在浏览器上运行的代码
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/browserify.svg)](https://www.npmjs.com/package/@gotoeasy/browserify)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/gotoeasy/npm-packages/blob/master/LICENSE)
<br>
<br>



## Sample
```js
const browserify = require('@gotoeasy/browserify');

let code = `
"use strict";

require("core-js/modules/es6.string.starts-with");

var flg = 'abc'.startsWith('a');
`;

(async function(){
    let rs = await browserify(code, './'); // 在当前目录查找补丁模块
    console.info(rs);
})();



// 转译结果如下
/*
(function(){function r(e,n,t)...
   ...
   ...
   ...
},{"./_export":9,"./_fails-is-regexp":10,"./_string-context":23,"./_to-length":25}],30:[function(require,module,exports){

"use strict";

require("core-js/modules/es6.string.starts-with");

var flg = 'abc'.startsWith('a');

},{"core-js/modules/es6.string.starts-with":29}]},{},[30]);
*/
```



## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

