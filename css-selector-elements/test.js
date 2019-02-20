
const test = require('ava');
const cssSelectorClasses = require('./');

test('样式标签名测试', t => {
	
    let selector,rs;

    selector = ".foo a .bar div > .baz";
	rs = cssSelectorClasses(selector);
	t.is(rs.join(','), 'a,div');

	selector = "SPAN.aaa";
	rs = cssSelectorClasses(selector);
	t.is(rs.join(','), 'span');

	selector = "span[class]";
	rs = cssSelectorClasses(selector);
	t.is(rs.join(','), 'span');
});
