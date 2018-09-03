const File = require('gotoeasy-file');
const event = require('./event');

function loadModules(){
	let path = __dirname + '/modules';
	File.files(path).forEach(f => {
		let name = '.' +  f.substring(f.lastIndexOf('/modules/'), f.length-3); // 例： './modules/m00-env'
		console.debug('require:', name);
		require(name); // etc. require('./modules/m00-env')
	});
}


module.exports = loadModules;
