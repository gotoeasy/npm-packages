const highlight = require('highlight.js');


module.exports = function (code='', lang) {
	lang = /^js$/i.test(lang) ? 'javascript' : lang;

	let rs = highlight.highlightAuto(code, lang);
	let html = '<ol><li>' + rs.value.split(/\r?\n/).join('</li><li>') + '</li></ol>';

	return html;
}
