
const test = require('ava');
const postcss = require('postcss');
const renamePlugin = require('./');

test('样式表修改类名测试', async t => {

	let options = { rename: name => 'my-' + name };
	let postcssOpts = { from: undefined };

	let css, rs;

	// 没有传选项的时候
	css = '.a {}';
	rs = await postcss([renamePlugin()]).process(css, postcssOpts);
	t.is(rs.css, '.a {}');
	t.is(rs.mapping.a, 'a');

	// 选项没有rename转换函数的时候
	css = '.a {}';
	rs = await postcss([renamePlugin({})]).process(css, postcssOpts);
	t.is(rs.css, '.a {}');
	t.is(rs.mapping.a, 'a');

	// 简单转换
	css = '.a {}';
	rs = await postcss([renamePlugin(options)]).process(css, postcssOpts);
	t.is(rs.css, '.my-a {}');
	t.is(rs.mapping.a, 'my-a');

	// 转换多个
	css = '.a {} .b{} div .c-d {}';
	rs = await postcss([renamePlugin(options)]).process(css, postcssOpts);
	t.is(rs.css, '.my-a {} .my-b{} div .my-c-d {}');
	t.is(rs.mapping.a, 'my-a');
	t.is(rs.mapping.b, 'my-b');
	t.is(rs.mapping['c-d'], 'my-c-d');

	// 稍微复杂点
	css = 'a [title] p > .a {} .b{} div .c-d {} a{} div #id > .nnn, div + span{} a:link {color: #FF0000}';
	rs = await postcss([renamePlugin(options)]).process(css, postcssOpts);
	t.is(rs.css, 'a [title] p > .my-a {} .my-b{} div .my-c-d {} a{} div #id > .my-nnn, div + span{} a:link {color: #FF0000}');
	t.is(rs.mapping.a, 'my-a');
	t.is(rs.mapping.b, 'my-b');
	t.is(rs.mapping['c-d'], 'my-c-d');

});
