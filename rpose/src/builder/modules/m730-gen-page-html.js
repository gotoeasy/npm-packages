const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const PTask = require('@gotoeasy/p-task');

module.exports = bus.on('生成页面HTML代码', function(){

	let ptask = new PTask(resolve => function(srcFile){

        let date = new Date();
        let ver = '?ver=' + date.getFullYear() + '' + (date.getMonth()+1) + '' + date.getDate();
		let fileName = srcFile.substring(srcFile.lastIndexOf('/') + 1, srcFile.length - 6); // pages/abc-def.rpose => acd-def
		resolve( `

<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Cache-Control" content="max-age=18000"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./${fileName}.js${ver}" defer></script>
<link href="./${fileName}.css${ver}" rel="stylesheet">
</head>
<body></body>
</html>

`.trim() );

	});


	return (srcFile) => ptask.start(srcFile);

}());
