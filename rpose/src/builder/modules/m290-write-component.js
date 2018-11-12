const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

module.exports = bus.on('组件代码输出', function(path){

	return function(tags, components){

		let env = bus.at('编译环境');
		if ( !path ) {
			path = env.path.build_temp_components + '/';
		}

		tags.forEach(tag => {
			let fileJs = path + tag + '.js';
			let fileCss = path + tag + '.css';

			let comp = components[tag];

			if ( comp.js ) {
				File.write(fileJs, comp.js);
				console.info(MODULE, 'write:', fileJs);
			} else if ( File.exists(fileJs) ){
				File.remove(fileJs);
				console.info(MODULE, 'remove: ', fileJs);
			}

			if ( comp.css ) {
				File.write(fileCss, comp.css);
				console.info(MODULE, 'write:', fileCss);
			} else if ( File.exists(fileCss) ){
				File.remove(fileCss);
				console.info(MODULE, 'remove: ', fileCss);
			}
		});

	};

}());
