const highlight = require('highlight.js');


module.exports = function (code='', lang) {

	let rs = highlight.highlightAuto(code);
	let html = '<ol><li>' + rs.value.split(/\r?\n/).join('</li><li>') + '</li></ol>';

	return html;
}
