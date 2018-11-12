const Btf = require('@gotoeasy/btf');
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');


function build(opts){

	require('./loadModules')();

	let env = bus.at('编译环境', opts);
	bus.at('clean');

	let files = File.files(env.path.src, 'components/**.btf', 'pages/**.btf');
//console.info('-------------files------------',files)
	bus.at('源文件清单', files );
	files.forEach(file => bus.at('添加源文件', file.replace(/\\/g, '/')) );
}


module.exports = build;

