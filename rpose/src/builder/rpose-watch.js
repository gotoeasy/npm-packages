const Btf = require('@gotoeasy/btf');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');


function build(opts){

	require('./loadModules')();

	let env = bus.at('编译环境', opts);
	bus.at('clean');

	let files = File.files(env.path.src, 'components/**.btf', 'pages/**.btf');
	bus.at('源文件清单', files );

	bus.at('源文件监听');

}


module.exports = build;

