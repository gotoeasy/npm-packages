
const File = require('@gotoeasy/file');
const bus = require('@gotoeasy/bus');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

module.exports = bus.on('clean', function(){

	return () => {
		try{
			let env = bus.at('编译环境');
			if ( env.clean ) {
				File.remove(env.path.build);

				console.debug('----------- p010-clean ----------- (clean)');
				console.info('clean:', env.path.build);
			}else{
				console.debug('----------- p010-clean ----------- (not clean)');
			}
		}catch(e){
			throw Error.err(MODULE + 'clean failed', e);
		}
	}

}());
