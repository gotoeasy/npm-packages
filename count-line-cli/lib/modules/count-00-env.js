const event = require('../event');


module.exports = event.on('环境', function(result={}){

	return (opts) => {

		if ( !opts ) {
			return result;
		}

		result.clean = opts.clean;
		result.path = opts.path.replace(/\\/g, '/');
		if ( result.path.substring(result.path.length-1) == '/' ) {
			result.path = result.path.substring(0, result.path.length-1);
		}
		result.urls = opts.urls;
		result.dirs = opts.dirs ? opts.dirs.map(dir => dir.replace(/\\/g, '/')) : null;
		result.debug = opts.debug;
		result.csv = opts.csv;
		result.work_path = result.path + '/work';

		return result;
	};

}());
