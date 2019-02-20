
const test = require('ava');
const csslibify = require('.');

test('样式库化按需引用测试', async t => {

	let css, pkg, lib, rs;

	// 没有传选项的时候
	css = '.a {} .a .b{}';
	lib = await csslibify('', css);
    rs = lib.get('.a');
	t.is(rs, '.a{}');
	lib = await csslibify('', css);
    rs = lib.get('.a');
	t.is(rs, '.a{}');
	lib = await csslibify('', css);
    rs = lib.get('.a');
	t.is(rs, '.a{}');

    // 指定pkg
	css = '.a {} .a .b{}';
	lib = await csslibify('mypkg', css);
    rs = lib.get('.a');
	t.is(rs, '.mypkg---a{}');
    let rename = (pkgname, cls) => `${pkgname?(pkgname+'-----'):''}${cls}`;
	lib = await csslibify('mypkg', css, {rename});
    rs = lib.get('.a');
	t.is(rs, '.mypkg-----a{}');

	css = '.a {} .a   .b{}';
    rename = (pkgname, cls) => `${pkgname?(pkgname+'___'):''}${cls}`;
	lib = await csslibify('mypkg', css, {rename});
    rs = lib.get('.a');
	t.is(rs, '.mypkg___a{}');


	css = '.a {} .b{color:var(--theme-color)} :root{--theme-font-size:14px;--theme-color:#333333;--theme-bgcolor:#f6f8fa;}';
	lib = await csslibify('mypkg', css);
    rs = lib.get('.b');
	t.is(rs, '.mypkg---b{color:#333333}');

	css = './testdata/bootstrap.css';
	lib = await csslibify('mypkg', css);
    rs = lib.get('order-first');
	t.is(rs.replace(/\s/g, ''), '.mypkg---order-first{order:-1;}');

//    rs = lib.get('progress-bar-animated');
//console.info(rs)

//    rs = lib.get('navbar-light', 'navbar-text');
//console.info(rs)

});
