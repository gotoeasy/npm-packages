const bus = require('@gotoeasy/bus');
const PTask = require('@gotoeasy/p-task');

module.exports = bus.on('生成页面HTML代码', function(){

	let ptask = new PTask(resolve => function(btfFile){

		let fileName = btfFile.substring(btfFile.lastIndexOf('/') + 1, btfFile.length - 4); // btf/pages/abc-def.btf => acd-def
		resolve( `

<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./${fileName}.js" defer></script>
<link href="./${fileName}.css" rel="stylesheet">
</head>
<body></body>
</html>

`.trim() );

	});


	return (btfFile) => ptask.start(btfFile);

}());
