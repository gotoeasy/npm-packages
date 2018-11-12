// ---------------------------
// 页面HTML代码输出
// ---------------------------
const Btf = require('@gotoeasy/btf');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');

const ClsTemplate = require('../ClsTemplate');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';


const txt = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./<%= $data.pageName %>.js" defer></script>
<link href="./<%= $data.pageName %>.css" rel="stylesheet">
</head>
<body></body>
</html>`;


module.exports = bus.on('页面HTML代码输出', function(clsTemplate){

	return (pageTag, targetFile) => {
		
		let env = bus.at('编译环境');
		if ( !clsTemplate ) {
			let conf = env.path.project + '/rpose-build-conf.btf';
			let tmpl = File.exists(conf) ? ( new Btf(conf).getText('template-page-html') || txt ) : txt;
			clsTemplate = new ClsTemplate(tmpl, '$data');
		}

//		let fileHtmlTemp = env.path.build_temp_pages + '/' + pageTag + '.html';
		let fileHtml = targetFile || (env.path.build_dist_pages + '/' + pageTag + '.html');
//		File.write( fileHtmlTemp, clsTemplate.toString({pageName: pageTag}) );
		File.write( fileHtml, clsTemplate.toString({pageName: pageTag}) );
		console.info(MODULE, 'write:', fileHtml);

	};

}());


