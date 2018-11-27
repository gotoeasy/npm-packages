# `@gotoeasy/p-task`
promise task
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/p-task.svg)](https://www.npmjs.com/package/@gotoeasy/p-task)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>
<br>

## Install
```
npm i @gotoeasy/p-task
```

## API
```js
const PTask = require('@gotoeasy/p-task');

let ptask = new PTask((resolve, reject, isBroken) => function(file){

	setTimeout(function(){
		if ( !isBroken() ) {
			console.info('execute ...', file);
			resolve(true);
		}
	}, 1000);

});

(async function(){
	let p1 = ptask.start('file.txt');
	let p2 = ptask.cancel('file.txt');
	let p3 = ptask.restart('file.txt');

	try{
		console.info('p1:', await p1);
	}catch(e){
		console.info('p1 error:', e);
	}

	try{
		console.info('p2:', await p2);
	}catch(e){
		console.info('p2 error:', e);
	}

	try{
		console.info('p3:', await p3);
	}catch(e){
		console.info('p3 error:', e);
	}
})();

// p1 error: canceled
// p2 error: canceled
// execute ... file.txt
// p3: true

```
<br>
<br>

## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

