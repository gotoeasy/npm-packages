
const test = require('ava');
const cssSelectorClasses = require('./');

test('样式类名测试', t => {
	
    let selector,rs;
/*
    selector = ".foo .bar > .baz";
	rs = cssSelectorClasses(selector);
	t.is(rs.classes.join(','), 'foo,bar,baz');

	selector = ".aaa";
	rs = cssSelectorClasses(selector);
	t.is(rs.classes.join(','), 'aaa');

	selector = ".aaa .bbb";
	rs = cssSelectorClasses(selector);
	t.is(rs.classes.join(','), 'aaa,bbb');

	selector = ".aaa .bbb > .ccc";
	rs = cssSelectorClasses(selector);
	t.is(rs.classes.join(','), 'aaa,bbb,ccc');
*/
	selector = "    A .aaa~.bbb+div > .ccc   ";
	rs = cssSelectorClasses(selector);
	t.is(rs.classes.join(','), 'aaa,bbb,ccc');
/*
	selector = ".btnprimary:not(:disabled):not(.disabled, .xxx):active:focus {box-shadow: 0 0 0 .2rem rgba(38, 143, 255, .5);}";
	rs = cssSelectorClasses(selector);
	t.is(rs.classes.join(','), 'btnprimary,disabled,xxx');
*/
});
