const test = require('ava');
const csslibify = require('.');

test('15 多选择器自动拆分引用（@media），重复，使用缓存，增加覆盖率', t => {
	let css, pkg, csslib, rs;

    pkg = 'pkg';
	csslib = csslibify(pkg);

    csslib.imp('@media (min-width: 768px) { .foo,.bar{margin: 0} }');
    rs = csslib.get( '.foo', '.bar' );
    isSameCss(t, rs, '@media (min-width: 768px) { .pkg---bar{margin: 0} } @media (min-width: 768px) { .pkg---foo{margin: 0} }');

	csslib = csslibify(pkg);

    csslib.imp('@media (min-width: 768px) { .foo,.bar{margin: 0} }');
    rs = csslib.get( '.foo', '.bar' );
    isSameCss(t, rs, '@media (min-width: 768px) { .pkg---bar{margin: 0} } @media (min-width: 768px) { .pkg---foo{margin: 0} }');
});

test('14 多选择器自动拆分引用（@media）-例子2', t => {
	let css, pkg, csslib, rs;

    pkg = 'pkg';
	csslib = csslibify(pkg);

    csslib.imp('@media (min-width: 768px) { .foo,.bar{margin: 0} }');
    rs = csslib.get( '.foo', '.bar' );
    isSameCss(t, rs, '@media (min-width: 768px) { .pkg---bar{margin: 0} } @media (min-width: 768px) { .pkg---foo{margin: 0} }');
});

test('13 多选择器自动拆分引用（@media）-例子1', t => {
	let css, pkg, csslib, rs;

    pkg = 'pkg';
	csslib = csslibify(pkg);

    csslib.imp('@media (min-width: 768px) { .foo,.bar{margin: 0} }');
    rs = csslib.get( '.foo' );
    isSameCss(t, rs, '@media (min-width: 768px) { .pkg---foo{margin: 0} }');
});


test('12 多选择器自动拆分引用-例子2', t => {
	let css, pkg, csslib, rs;

    pkg = 'pkg';
	csslib = csslibify(pkg);

    csslib.imp('.foo,.bar{size:1} .bar,.baz{color:red}');
    rs = csslib.get( '.foo', '.bar' );
    isSameCss(t, rs, '.pkg---bar{size:1} .pkg---foo{size:1} .pkg---bar{color:red}');
});


test('11 多选择器自动拆分引用-例子1', t => {
	let css, pkg, csslib, rs;

    pkg = 'pkg';
	csslib = csslibify(pkg);

    csslib.imp('.foo,.bar{size:1} .bar,.baz{color:red}');
    rs = csslib.get( '.foo' );
    isSameCss(t, rs, '.pkg---foo{size:1}');
});


test('10 样式类按需引用，含not条件-例子3', t => {
	let css, pkg, csslib, rs;

    pkg = 'pkg';
	csslib = csslibify(pkg);

    csslib.imp('.foo{size:1} .bar{size:2} .foo:not(.bar){size:3}');
    rs = csslib.get( '.foo', '.bar' );
    isSameCss(t, rs, '.pkg---foo{size:1} .pkg---bar{size:2} .pkg---foo:not(.pkg---bar){size:3}');
});


test('09 样式类按需引用，含not条件-例子2', t => {
	let css, pkg, csslib, rs;

    pkg = 'pkg';
	csslib = csslibify(pkg);

    csslib.imp('.foo{size:1} .bar{size:2} .foo:not(.bar){size:3}');
    rs = csslib.get( '.bar' );
    isSameCss(t, rs, '.pkg---bar{size:2}');
});


test('08 样式类按需引用，含not条件-例子1', t => {
	let css, pkg, csslib, rs;

    pkg = 'pkg';
	csslib = csslibify(pkg);

    csslib.imp('.foo{size:1} .bar{size:2} .foo:not(.bar){size:3}');
    rs = csslib.get( '.foo' );
    isSameCss(t, rs, '.pkg---foo{size:1} .pkg---foo:not(.pkg---bar){size:3}');
});



test('07 样式类按需引用-例子3', t => {
	let css, pkg, csslib, rs;

    pkg = '';
	csslib = csslibify();

    csslib.imp('.foo{size:1}');
    csslib.imp('.bar .baz{size:2}');
    csslib.imp('.baz{size:3}');

    rs = csslib.get( '.bar', '.baz' );
    isSameCss(t, rs, '.bar .baz{size:2} .baz{size:3}');
});

test('06 样式类按需引用-例子2', t => {
	let css, pkg, csslib, rs;

    pkg = '';
	csslib = csslibify();

    csslib.imp('.foo{size:1}');
    csslib.imp('.bar .baz{size:2}');
    csslib.imp('.baz{size:3}');

    rs = csslib.get( '.baz' );
    isSameCss(t, rs, '.baz{size:3}');
});

test('05 样式类按需引用-例子1', t => {
	let css, pkg, csslib, rs;

    pkg = '';
	csslib = csslibify();

    csslib.imp('.foo{size:1}');
    csslib.imp('.bar{size:2}');
    csslib.imp('.baz{size:3}');

    rs = csslib.get( '.baz' );
    isSameCss(t, rs, '.baz{size:3}');
});


test('04 readme中的简易例子', t => {
	let css, pkg, csslib, rs;

    pkg = 'thepkg';
	csslib = csslibify(pkg);

	css = '.foo{size:11} .bar{size:12} .foo > .bar{color:red}';
    csslib.imp(css);
	css = '.baz{size:13}';
    csslib.imp(css);

    rs = csslib.get( '.bar', '.baz' );
    isSameCss(t, rs, '.thepkg---bar{size:12} .thepkg---baz{size:13}');

    rs = csslib.get( '.foo', '.bar' );
    isSameCss(t, rs, '.thepkg---foo{size:11} .thepkg---bar{size:12} .thepkg---foo > .thepkg---bar{color:red}');
});


test('03 导入样式库，无库名，多次导入自动合并，无重复', t => {
	let css, pkg, csslib, rs;
	csslib = csslibify();

	css = '.foo{size:1}';
    csslib.imp(css);
	css = '.foo{size:1}';
    csslib.imp(css);
	css = '.foo{size:1}';
    csslib.imp(css);

    rs = csslib.nodes.length;
    t.is(rs, 1);
    rs = csslib.get( '.foo', '.bar' );
    isSameCss(t, rs, '.foo{size:1}');
});

test('02 导入样式库，无库名，多次导入自动合并', t => {
	let css, pkg, csslib, rs;
	csslib = csslibify();

	css = '.foo{size:1}';
    csslib.imp(css);
	css = '.bar{size:2}';
    csslib.imp(css);

    rs = csslib.get( '.foo', '.bar' );
    isSameCss(t, rs, '.foo{size:1} .bar{size:2}');
});


test('01 导入样式库，指定库名，多次导入自动合并', t => {
	let css, pkg, csslib, rs;

    pkg = 'pkg';
	csslib = csslibify(pkg);

	css = '.foo{size:1}';
    csslib.imp(css);
	css = '.bar{size:2}';
    csslib.imp(css);

    rs = csslib.get( '.foo', '.bar' );
    isSameCss(t, rs, '.pkg---foo{size:1} .pkg---bar{size:2}');
});




















function isSameCss(t, css1, css2){
    let rs = hashCss(css1.toLowerCase()) === hashCss(css2.toLowerCase());
    if ( rs ) return t.is(true, true);

    t.is(css1, css2);
}

function hashCss(str){
	let rs = 0, i = (str == null ? 0 : str.length), ch;
	while ( i ) {
        ch = str.charCodeAt(--i);
        if (  ch > 32 || ch < 9 || (ch !== 9 && ch !== 10 && ch !== 13 && ch !== 32 )  ) {    // 忽略回车换行tab空格(9/10/13/32)
            rs = (rs * 33) ^ ch;
        }
	}
	return rs >>> 0;
}
