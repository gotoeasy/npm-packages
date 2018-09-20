const File = require('gotoeasy-file');
const event = require('../event');


module.exports = event.on('统计结果汇总输出', function(){

	return () => {

		let env = event.at('环境');
		let pjts = event.at('统计项目行数');
		let txt = 'type\tcode\tcomment\tblank\ttotal\tfile\n';
		let pjRs, total = 0, code = 0, comment = 0, blank = 0, ext, extSummary = {}, extCnt;

		for ( let k in pjts ) {
			pjRs = pjts[k];

			pjRs.list.forEach(r => {
				total += r.total;
				code += r.code;
				comment += r.comment;
				blank += r.blank;

				ext = getExt(r.file);
				extCnt = extSummary[ext] = (extSummary[ext] || {total: 0, code: 0, comment: 0, blank: 0});
				extCnt.total += r.total;
				extCnt.code += r.code;
				extCnt.comment += r.comment;
				extCnt.blank += r.blank;

				txt += ext + '\t' + r.code + '\t' + r.comment + '\t' + r.blank +  '\t' + r.total + '\t' + r.file.replace(env.work_path + '/', '') + '\n'
			});
		}


		let summary = ['type\tcode\tcomment\tblank\ttotal\t'];
		let ary = [];
		env.exts.forEach(k => {
			extCnt = extSummary[k] || {total: 0, code: 0, comment: 0, blank: 0};
			summary.push( k + '\t' + extCnt.code + '\t' + extCnt.comment + '\t' + extCnt.blank +  '\t' + extCnt.total + '\t' );
		});

		summary.push(  '\t' + code + '\t' + comment + '\t' + blank +  '\t' + total + '\t' );
		summary.push( '\t\t\t\t\t\n' );

		if ( env.csv ) {
			let file = env.path + '/count-line-result.csv';
			File.write(file, summary.join('\n') + txt);
			console.log('count result:', file);
		}

		summary.pop();
		summary.pop();

		let line = '-----------------------------------------------------------------';
		console.log();
		console.log();
		summary.push( '\t' + code + '\t' + comment + '\t' + blank + '\t' + total );
		summary.forEach( (v,i) => table(summary, v, i) );
		summary.splice(1, 0, line);
		summary.splice(0, 0, line);
		summary.splice(summary.length-1, 0, line);
		summary.forEach(v => console.log(v) );
		console.log();

	};

}());


function getExt(file){
	let nm = file.substring(file.lastIndexOf('/')+1);
	let idx = nm.lastIndexOf('.');
	return idx >= 0 ? nm.substring(idx+1) : '';
}

function table(summary, v, idx){
	let ary = v.split('\t'), tmp;
	ary[0] = ('  ' + ary[0]  + '                    ').substring(0,15);
	for ( let i=1; i<ary.length; i++ ) {
		tmp = '                    ' + ary[i];
		ary[i] = tmp.substring(tmp.length - 12);
	}
	summary[idx] = ary.join('');
}
