const File = require('gotoeasy-file');
const event = require('../event');


module.exports = event.on('统计信息输出', function(){

	return (path, project) => {

		let result = event.at('统计项目行数')[project];

		let total = 0, code = 0, comment = 0, blank = 0;
		let env = event.at('环境');
		let txt = 'total\tcode\tcomment\tblank\ttype\tfile\n';
		result.list.forEach(r => {
			total += r.total;
			code += r.code;
			comment += r.comment;
			blank += r.blank;
			txt += r.total + '\t' + r.code + '\t' + r.comment + '\t' + r.blank +  '\t' + getExt(r.file) + '\t' + r.file.replace(env.work_path + '/', '') + '\n'
		});

		if ( env.csv ) {
			let file = env.path + '/' + project + '.csv';
			File.write(file, txt);
			console.log('count result:', file);
		}

		console.log();
		console.log('------------------------', project, '------------------------');
		console.log('total:', total, 'code:', code, 'comment:', comment, 'blank:', blank);
		console.log();

	};

}());


function getExt(file){
	let nm = file.substring(file.lastIndexOf('/')+1);
	let idx = nm.lastIndexOf('.');
	return idx >= 0 ? nm.substring(idx+1) : '';
}