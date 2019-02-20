# @gotoeasy/css-selector-elements
get elements from css selector
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/css-selector-elements.svg)](https://www.npmjs.com/package/@gotoeasy/css-selector-elements)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>
<br>

## Install
```
npm i @gotoeasy/css-selector-elements
```

## Sample
```js
const cssSelectorElements = require('@gotoeasy/css-selector-elements');
let selector = "a .foo span.bar > div.baz";
let rs = cssSelectorElements(selector); // => ['a', 'span', 'div']
```


## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

