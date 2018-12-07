# @gotoeasy/csjs
CSS、JS的编译、美化、压缩等常用操作封装
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/csjs.svg)](https://www.npmjs.com/package/@gotoeasy/csjs)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>
<br>

## Install
```
npm i @gotoeasy/csjs
```

## Sample - less to css
```js
const csjs = require('@gotoeasy/csjs');
let lessCode = `
        @base: #f938ab;
	.box {
	    color: @base;
	}`;

(async function(){
	let rs = await csjs.lessToCss(lessCode);
	console.info(rs.css);
})();

/*
.box {
  color: #f938ab;
}
*/
```

## Sample - sass to css
```js
const csjs = require('@gotoeasy/csjs');
let sassCode = `
        $base: #f938ab;
	.box {
	    color: $base;
	}`;

(async function(){
	let css = await csjs.sassToCss(sassCode);
	console.info(css);
})();

/*
.box {
  color: #f938ab;
}
*/
```

## Sample - format css
```js
const csjs = require('@gotoeasy/csjs');
(async function(){
	let rs = await csjs.formatCss('.box { color: #f938ab; }');
	console.info(rs.css);
})();

/*
.box {
  color: #f938ab;
}
*/
```

## Sample - minify css
```js
const csjs = require('@gotoeasy/csjs');
(async function(){
	let rs = await csjs.miniCss('.box { color: #f938ab; }');
	console.info(rs.css);
})();
/*
.box{color:#f938ab}
*/
```

## Sample - format js
```js
const csjs = require('@gotoeasy/csjs');
let jsCode = `
(function(window){
	class Component { constructor(html, props={}, defaults={}) {
			let template = new Template(html, '$props, $data');
		this.render = $data =>{ let model = extend(defaults, $data); 
return createDocumentFragment( template.toString(props, model) );}
	}} window.TheComponent = Component;

}(window))
`;

let jsFmt = csjs.formatJs(jsCode);
console.info(jsFmt);
/*
(function(window) {
    class Component {
        constructor(html, props = {}, defaults = {}) {
            let template = new Template(html, "$props, $data");
            this.render = $data => {
                let model = extend(defaults, $data);
                return createDocumentFragment(template.toString(props, model));
            };
        }
    }
    window.TheComponent = Component;
})(window);
*/
```

## Sample - minify js
```js
const csjs = require('@gotoeasy/csjs');
let jsCode = `
(function(window) {
    class Component {
        constructor(html, props = {}, defaults = {}) {
            let template = new Template(html, "$props, $data");
            this.render = $data => {
                let model = extend(defaults, $data);
                return createDocumentFragment(template.toString(props, model));
            };
        }
    }
    window.TheComponent = Component;
})(window);
`;

let jsMin = csjs.miniJs(jsCode);
console.info(jsCode);
/*
!function(e){e.TheComponent=class{constructor(e,t={},n={}){let r=new Template(e,"$props, $data");this.render=(e=>{let o=extend(n,e);return createDocumentFragment(r.toString(t,o))})}}}(window);
*/
```


## Sample - babel transform js
```js
const csjs = require('@gotoeasy/csjs');
let code = `
    let fn = (...args) => args.includes('y') ? Promise.resolve(args) : Promise.reject(args);
`;

let js = csjs.babel(code);
console.info(js);
```


## Sample - browserify transform js
```js
const csjs = require('@gotoeasy/csjs');
let code = `
"use strict";

require("core-js/modules/es6.string.starts-with");

var flg = 'abc'.startsWith('a');
`;

(async function(){
    let js = await csjs.browserify(code);
    console.info(js);
})();
```


## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

