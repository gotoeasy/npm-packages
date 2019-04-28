# @gotoeasy/css-selector-classes
get classes from css selector
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/css-selector-classes.svg)](https://www.npmjs.com/package/@gotoeasy/css-selector-classes)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/gotoeasy/npm-packages/blob/master/LICENSE)
<br>
<br>

## Install
```
npm i @gotoeasy/css-selector-classes
```

## Sample
```js
const csc = require('@gotoeasy/css-selector-classes');
let selector = ".foo .bar > .baz";
let rs = csc(selector); // => rs.classes = ['foo', 'bar', 'baz']
```


## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

