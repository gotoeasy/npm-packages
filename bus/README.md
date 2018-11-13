# `@gotoeasy/bus`
simple event bus
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/bus.svg)](https://www.npmjs.com/package/@gotoeasy/bus)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>
<br>

## Install
```
npm i @gotoeasy/bus
```

## API
```js
const bus = require('@gotoeasy/bus');

bus.on('input', function(txt){
    console.log('input ...', txt);
})

bus.at('input', 'abc'); // input ... abc

```
<br>
<br>

## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

