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

## Sample
```js
const csjs = require('@gotoeasy/csjs');

// CSS
let lessCode = `
        @base: #f938ab;
	.box {
	    color: @base;
	}`;

(async function(){
	let rs = await csjs.lessToCss(lessCode);
	console.info(rs.css);
	/*
	.box {
	  color: #f938ab;
	}
	*/
})();

let cssFmt = csjs.formatCss('.box { color: #f938ab; }');
console.info(cssFmt);
/*
.box {
    color: #f938ab;
}
*/

let cssMin = csjs.miniCss(cssFmt);
console.info(cssMin);
/*
.box{color:#f938ab}
*/


// JS
let jsCode = `
(function(window){

	class Component { constructor(html, props={}, defaults={}) {
			let template = new Template(html, '$props, $data');

			this.render = $data =>{ let model = extend(defaults, $data); return createDocumentFragment( template.toString(props, model) );}
		}
	}

	window.TheComponent = Component;

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

let jsMin = csjs.miniJs(jsFmt);
console.info(jsMin);
/*
!function(e){e.TheComponent=class{constructor(e,t={},n={}){let r=new Template(e,"$props, $data");this.render=(e=>{let o=extend(n,e);return createDocumentFragment(r.toString(t,o))})}}}(window);
*/

jsFmt = csjs.formatJs(jsMin);
console.info(jsFmt);
/*
!(function(e) {
    e.TheComponent = class {
        constructor(e, t = {}, n = {}) {
            let r = new Template(e, "$props, $data");
            this.render = e => {
                let o = extend(n, e);
                return createDocumentFragment(r.toString(t, o));
            };
        }
    };
})(window);
*/


```


## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

