
// 选项的cwd和presets使用固定配置，不支持修改
module.exports = async function(code, basedir, paths=[]){
	if ( !code ) {
		return code;
	}

	let opts = {};
	opts.entries = [require('into-stream')(code)];
	opts.basedir = basedir || __dirname;
	opts.paths   = ['../../core-js-compat/node_modules', ...paths];   // babel指定core-js@3时的麻烦事

	try{
		let stream = require('browserify')(opts).bundle();
		return await require('stream-to-string')(stream) ;
	}catch(e){
		console.error('[@gotoeasy/browserify] browserify transform failed (basedir =', opts.basedir, ')');
		throw e;
	}
}

