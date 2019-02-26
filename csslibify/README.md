# csslibify
一个CSS样式库化工具
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/csslibify.svg)](https://www.npmjs.com/package/csslibify)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>
<br>



## Install
```
npm i csslibify
```


## API
- [x] csslibify(packageName) - create a csslib with package name<br>
- [x] csslib.imp(cssOrFile, opts) - import css or css file into csslib<br>
- [x] csslib.get(...args) - get css from csslib by class names<br>


## Sample
```js
let csslibify = require('csslibify');
let csslib = csslibify('thepkg');
csslib.imp('.foo{size:11} .bar{size:12} .foo > .bar{color:red}');
csslib.imp('.baz{size:13}');
let css = csslib.get('.bar', '.baz');
//=>  .thepkg---bar{size:12} .thepkg---baz{size:13}

css = csslib.get('.foo', '.bar');
//=>  .thepkg---foo{size:11} .thepkg---bar{size:12} .thepkg---foo > .thepkg---bar{color:red}
```

## 测试结果示例
<details>
<summary><strong>新建样式库并指定库名，可有效避免类名冲突，也便于复用</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify('pkg');
csslib.imp('.foo{size:1}');
csslib.imp('.bar{size:2}');

let result = csslib.get( '.foo', '.bar' );

/*
// result:

.pkg---foo{size:1}
.pkg---bar{size:2}
*/
```
</details>


<details>
<summary><strong>新建样式库不指定库名，便于直接使用样式</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify();
csslib.imp('.foo{size:1}');
csslib.imp('.bar{size:2}');

let result = csslib.get( '.foo', '.bar' );

/*
// result:

.foo{size:1}
.bar{size:2}
*/
```
</details>


<details>
<summary><strong>自动识别重复导入</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify();
csslib.imp('.foo{size:1}');
csslib.imp('.foo{size:1}');
csslib.imp('.foo{size:1}');

let result = csslib.get( '.foo' );

/*
// result:

.foo{size:1}
*/
```
</details>


<details>
<summary><strong>样式类按需引用-例子1</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify();
csslib.imp('.foo{size:1}');
csslib.imp('.bar{size:2}');
csslib.imp('.baz{size:3}');

let result = csslib.get( '.baz' );

/*
// result:

.baz{size:3}
*/
```
</details>


<details>
<summary><strong>样式类按需引用-例子2</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify();
csslib.imp('.foo{size:1}');
csslib.imp('.bar .baz{size:2}');
csslib.imp('.baz{size:3}');

let result = csslib.get( '.baz' );

/*
// result:

.baz{size:3}
*/
```
</details>


<details>
<summary><strong>样式类按需引用-例子3</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify();
csslib.imp('.foo{size:1}');
csslib.imp('.bar .baz{size:2}');
csslib.imp('.baz{size:3}');

let result = csslib.get( '.bar', '.baz' );

/*
// result:

.bar .baz{size:2}
.baz{size:3}
*/
```
</details>


<details>
<summary><strong>样式类按需引用(含not条件)-例子1</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify('pkg');
csslib.imp('.foo{size:1} .bar{size:2} .foo:not(.bar){size:3}');

let result = csslib.get( '.foo' );

/*
// result:

.pkg---foo{size:1}
.pkg---foo:not(.pkg---bar){size:3}
*/
```
</details>


<details>
<summary><strong>样式类按需引用(含not条件)-例子2</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify('pkg');
csslib.imp('.foo{size:1} .bar{size:2} .foo:not(.bar){size:3}');

let result = csslib.get( '.bar' );

/*
// result:

.pkg---bar{size:2}
*/
```
</details>


<details>
<summary><strong>样式类按需引用(含not条件)-例子3</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify('pkg');
csslib.imp('.foo{size:1} .bar{size:2} .foo:not(.bar){size:3}');

let result = csslib.get( '.foo', '.bar' );

/*
// result:

.pkg---foo{size:1}
.pkg---bar{size:2}
.pkg---foo:not(.pkg---bar){size:3}
*/
```
</details>


<details>
<summary><strong>多选择器自动拆分引用-例子1</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify('pkg');
csslib.imp('.foo,.bar{size:1} .bar,.baz{color:red}');

let result = csslib.get( '.foo' );

/*
// result:

.pkg---foo{size:1}
*/
```
</details>


<details>
<summary><strong>多选择器自动拆分引用-例子2</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify('pkg');
csslib.imp('.foo,.bar{size:1} .bar,.baz{color:red}');

let result = csslib.get( '.foo', '.bar' );

/*
// result:

.pkg---bar{size:1}
.pkg---foo{size:1}
.pkg---bar{color:red}
*/
```
</details>


<details>
<summary><strong>多选择器自动拆分引用（@media）-例子1</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify('pkg');
csslib.imp('@media (min-width: 768px) { .foo,.bar{margin: 0} }');

let result = csslib.get( '.foo' );

/*
// result:

@media (min-width: 768px) { .pkg---foo{margin: 0} }
*/
```
</details>


<details>
<summary><strong>多选择器自动拆分引用（@media）-例子2</strong></summary>

```js
let csslibify = require('csslibify');
let csslib = csslibify('pkg');
csslib.imp('@media (min-width: 768px) { .foo,.bar{margin: 0} }');

let result = csslib.get( '.foo', '.bar' );

/*
// result:

@media (min-width: 768px) { .pkg---bar{margin: 0} }
@media (min-width: 768px) { .pkg---foo{margin: 0} }
*/
```
</details>







## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

