# `@gotoeasy/btf`
A JavaScript ![`Block-Text-File`](https://github.com/gotoeasy/block-text-file) Parser
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/btf.svg)](https://www.npmjs.com/package/@gotoeasy/btf)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/gotoeasy/npm-packages/blob/master/LICENSE)
<br>
<br>

## Install
```
npm i @gotoeasy/btf
```

## API
* BlockTextFile.getText(blockName) - get text of blockName from the first Document
* BlockTextFile.getMap(blockName) - get key-value map of blockName from the first Document
* BlockTextFile.getDocument() - get the first Document
* BlockTextFile.getDocuments() - get the Document array
* Document.getText(blockName) - get text of blockName from the Document
* Document.getMap(blockName) - get key-value map of blockName from the Document

```js
sample.btf
[key1]
value1
---------

[key2]
value2

[key-value]
k1 : v1
k2 = v2

=========
[name1]
111
[name2]
222
[]
333
[\]
\
[\]]
]
[\]\]
\---------
[\][\]]
\=========
```

```js
// parser sample.btf
const BlockTextFile = require('@gotoeasy/btf');

let btf = new BlockTextFile('sample.btf');

console.info(btf.getText('key1') == 'value1'); // true
console.info(btf.getText('key2') == 'value2\n'); // true

let map = btf.getMap('key-value');
console.info(map.get('k1') == 'v1'); // true
console.info(map.get('k2') == 'v2'); // true

let docs = btf.getDocuments(); // array
console.info(docs.length == 2); // true
let doc1 = docs[0];
console.info(doc1.getText('key1') == 'value1'); // true
console.info(doc1.getText('key2') == 'value2\n'); // true
let doc2 = docs[1];
console.info(doc2.getText('name1') == '111'); // true
console.info(doc2.getText('name2') == '222'); // true
console.info(doc2.getText('') == '333'); // true
console.info(doc2.getText('\\') == '\\'); // true
console.info(doc2.getText(']') == ']'); // true
console.info(doc2.getText(']\\') == '---------'); // true
console.info(doc2.getText('][]') == '========='); // true

```
<br>
<br>

## `Links`
* `Block-Text-File Specification` https://github.com/gotoeasy/block-text-file
* `npm-packages` https://github.com/gotoeasy/npm-packages

