const File = require('@gotoeasy/file');

function loadModules(){
	let path = __dirname + '/modules';
	File.files(path).forEach(f => {
		if ( f.substring(f.lastIndexOf('.')) == '.js' ) {
			let name = '.' +  f.substring(f.lastIndexOf('/modules/')); // 例： './modules/m00-env.js'
			console.debug('require:', name);
			require(name); // etc. require('./modules/m00-env.js')
		}
	});
}

module.exports = loadModules;
