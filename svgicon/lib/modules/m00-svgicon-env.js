// ---------------------------------------------
// svg缓存数据
// ---------------------------------------------
const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');

module.exports = bus.on('svgicon-env', function(env){

	return () => {
        if ( !env ) {
            let build = File.resolve(__dirname, '../../build').replace(/\\/g, '/');
            let temp = File.resolve(build, 'temp').replace(/\\/g, '/');
            let dist = File.resolve(build, 'dist').replace(/\\/g, '/');
            File.mkdir(temp);
            env = {path:{build, temp, dist}};
        }
        
        return env;
	};

}());
