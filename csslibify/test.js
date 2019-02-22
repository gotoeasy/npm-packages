const test = require('ava');
const postcss = require('postcss');
const csslibify = require('.');

test('样式库化按需引用测试', async t => {

	let css, pkg, csslib, rs;

    pkg = 'thepkg';
	css = '.foo{color:#001} .bar{color:#002} input{color:#003}';
	csslib = await csslibify.imp(pkg, css);

    rs = csslib.get( {classes:['foo']} );
console.info('------------------', rs)
//	t.is(rs, await formatCss('.thepkg---foo{color:#001;}') );
//	t.is(await formatCss(rs), await formatCss('.thepkg---foo{color:#001}') );


/*
	css = '.a  ,   div.show    > span    {color:#00a} @-webkit-keyframes sssss{ 0%{color : #00b ;size:12} } @supports ((position: -webkit-sticky) or (position: sticky)) {}';
	css = 'abbr[title]  {color:#00a} a[sasa="dd"]  {color:#00a}';
	css = '* {color:#00a} [sasa="dd"]  {color:#00a}';
	css = '.a .b {color:#00a}';
	css = '::-webkit-file-upload-button  {color:#00a}';
	css = ':focus {color:#00a}';
	css = './testdata/bootstrap.css';

	lib = await csslibify.imp('skope', css);
//console.info('-----------lib.get-------', lib.get)
    rs = lib.get({pkg: 'bs', classes:['btn', 'btn-primary', 'disabled']});
	t.is('', '');


console.info('------------------', rs)
*/


});


async function formatCss(css){
    let rs = await postcss([require('stylefmt')]).process(css, {from:'from.css'});
    return rs.css
}