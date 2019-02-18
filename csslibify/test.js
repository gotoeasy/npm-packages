
const test = require('ava');
const csslibify = require('.');

test('样式库化按需引用测试', async t => {

	let css, pkg, lib, rs;

	// 没有传选项的时候
	css = '.a {} .a .b{}';
	lib = await csslibify(css);
    rs = lib.get('.a');
	t.is(rs, '.a {}');
	lib = await csslibify(css, 'default');
    rs = lib.get('.a');
	t.is(rs, '.a {}');
	lib = await csslibify(css, 'default', true);
    rs = lib.get('.a');
	t.is(rs, '.a {}');

});
