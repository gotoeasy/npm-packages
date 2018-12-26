module.exports = (a, b) => {
	if ( b === 0 ) {
		throw new Error('invalid parameter (b=0)')
	}
	return a/b;
};
