
module.exports = {
	build: require('./src/builder/rpose-build'),
	watch: require('./src/builder/rpose-watch'),
	publish: require('./src/builder/rpose-publish'),
	clean: require('./src/builder/rpose-clean')
};

