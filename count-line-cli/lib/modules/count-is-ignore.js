const event = require('../event');
const IsIgnore = require('is-ignore');


module.exports = event.on('is-ignore', function(result={}){


	return (project) => {

		if ( result[project] ) {
			return result[project];
		}

		let env = event.at('环境');
		let opts = {
			debug: env.debug,
			path: env.prjs[project]
		};
		result[project] = new IsIgnore(opts);

		return result[project];
	};

}());

