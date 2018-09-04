# npm-packages
根据`.gitignore`文件的配置，判断指定文件或目录是否要忽略。<br>
指定git仓库的文件目录即可，`.gitignore`文件将自动读取
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/is-ignore.svg)](https://www.npmjs.com/package/is-ignore)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>
<br>

## Install
```
npm i is-ignore
```


## API

* `const IsIgnore = require('is-ignore')`: return the class of `is-ignore`
* `let ignore = new IsIgnore(opts)`: create instance
  * `opts.path`: target directory.
* `ignore.isIgnore(file)`: returns `true` if pattern is ignored, `false` otherwise.


## Sample
D:/test/.gitignore
```
/node_modules
```

```js
const IsIgnore = require('is-ignore');

let ignore = new IsIgnore({path: 'D:/test'});

console.log(ignore.isIgnore('D:/test/README.md'));     // false
console.log(ignore.isIgnore('D:/test/node_modules'));  // true
```

## NOTE
* 根目录有`.gitignore`文件时将被利用并忽略相关文件，但解析匹配可能有搞错的情况

