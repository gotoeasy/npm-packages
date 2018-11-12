
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');


module.exports = bus.on('clean', function(){

	return () => {
		let env = bus.at('编译环境');
		if ( env.clean ) {
			File.remove(env.path.build);

			console.debug('----------- p010-clean ----------- (clean)');
			console.info('clean:', env.path.build);
		}else{
			console.debug('----------- p010-clean ----------- (not clean)');
		}
	}

}());
