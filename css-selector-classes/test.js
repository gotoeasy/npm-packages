
const test = require('ava');
const cssSelectorClasses = require('./');

test('样式类名测试', t => {

	let selector = ".foo .bar > .baz";
	let rs = cssSelectorClasses(selector);
	t.is(rs.classes.join(','), '.foo,.bar,.baz');

	selector = ".aaa";
	rs = cssSelectorClasses(selector);
	t.is(rs.classes.join(','), '.aaa');

	selector = ".aaa .bbb";
	rs = cssSelectorClasses(selector);
	t.is(rs.classes.join(','), '.aaa,.bbb');

	selector = ".aaa .bbb > .ccc";
	rs = cssSelectorClasses(selector);
	t.is(rs.classes.join(','), '.aaa,.bbb,.ccc');

	selector = "    a .aaa~.bbb+div > .ccc   ";
	rs = cssSelectorClasses(selector);
	t.is(rs.classes.join(','), '.aaa,.bbb,.ccc');

});
