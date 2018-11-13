const File = require('@gotoeasy/file');

function loadModules(){
	// 只运行一次
	if ( loadModules.loaded ) {
		return;
	}
	loadModules.loaded = true;

	// modules目录下的js文件，无序的依次调用require装载
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

