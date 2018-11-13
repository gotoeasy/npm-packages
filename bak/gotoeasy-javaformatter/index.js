const prc = require('gotoeasy-process');

function format(...files){
	let java = process.env.JAVA_HOME ? process.env.JAVA_HOME + '/bin/java' : 'java';
	let cmd = java + ' -jar "' + __dirname + '/javaformatter.jar" ' + files.join(' ');
	prc.exec(cmd);
};

module.exports = format;
