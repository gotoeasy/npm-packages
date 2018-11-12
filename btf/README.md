# `@gotoeasy/btf`
A JavaScript ![`Block-Text-File`](https://github.com/gotoeasy/block-text-file) Parser
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/btf.svg)](https://www.npmjs.com/package/@gotoeasy/btf)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>
<br>

## Install
```
npm i @gotoeasy/btf
```

## API
* BlockTextFile.getDocuments() - get the Document array
* BlockTextFile.getText(blockName) - get text of blockName from the first Document
* Document.getText(blockName) - get text of blockName from the Document

```js
sample.btf
[key1]
value1
----------------

[key2]
value2

================
[name1]
111
[name2]
222
```

```js
// parser sample.btf
const BlockTextFile = require('gotoeasy-btf');

let btf = new BlockTextFile('sample.btf');

console.info(btf.getText('key1') == 'value1'); // true
console.info(btf.getText('key2') == 'value2\n'); // true

let docs = btf.getDocuments(); // array
console.info(docs.length == 2); // true
let doc1 = docs[0];
console.info(doc1.getText('key1') == 'value1'); // true
console.info(doc1.getText('key2') == 'value2\n'); // true
let doc2 = docs[1];
console.info(doc2.getText('name1') == '111'); // true
console.info(doc2.getText('name2') == '222'); // true

```
<br>
<br>

## `Links`
* `Block-Text-File` Specification https://github.com/gotoeasy/block-text-file

