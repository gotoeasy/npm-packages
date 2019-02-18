
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

    // 指定pkg
	css = '.a {} .a .b{}';
	lib = await csslibify(css, {pkg: 'mypkg'});
    rs = lib.get('.a');
	t.is(rs, '.mypkg---a {}');
    let rename = (pkgname, cls) => `.${pkgname?(pkgname+'-----'):''}${cls.substring(1)}`;
	lib = await csslibify(css, {pkg: 'mypkg', rename});
    rs = lib.get('.a');
	t.is(rs, '.mypkg-----a {}');

	css = '.a {} .a   .b{}';
    rename = (pkgname, cls) => `.${pkgname?(pkgname+'___'):''}${cls.substring(1)}`;
	let lib2 = await csslibify(css, {pkg: 'mypkg', rename});
    let rs2 = lib2.get('.a');
	t.is(rs2, '.mypkg___a {}');
    rs = lib.get('.a');
	t.is(rs, '.mypkg-----a {}');

});
