const dotgitignore = require('dotgitignore');

class IsIgnore {
	constructor(opts) {
		if ( !opts || !opts.path) {
			throw new Error('invalid constructor parameter of IsIgnore: ' + opts);
		}

		this.path = opts.path.replace(/\\/g, '/');
		let dotgit = dotgitignore({cwd: this.path});

		this.isIgnore = file => {
			let nm = file.replace(/\\/g, '/');
			return nm.indexOf(this.path) == 0 ? dotgit.ignore(nm.substring(this.path.length+1)) : dotgit.ignore(nm);
		}
	}

}

module.exports = IsIgnore;
