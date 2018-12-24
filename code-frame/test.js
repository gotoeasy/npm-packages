import test from 'ava';
import codeframe from '.';

test('文本 + 单一位置', t => {

	let text = '1\n2\n3\n4\n5xxxxx\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15';
	let pos = 9;

	let rs = codeframe(text, pos);
	let exp = '   2 | 2\n   3 | 3\n   4 | 4\n > 5 | 5xxxxx\n     |  ^^^^^\n   6 | 6\n   7 | 7\n   8 | 8';
	t.is(rs, exp);

});

test('文本 + 开始位置、结束位置', t => {

	let text = '1\n2\n3\n4\n5xxxxx\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15';
	let from = 9;
	let to = 17;

	let rs = codeframe(text, from, to);
	let exp = '    2 | 2\n    3 | 3\n    4 | 4\n >  5 | 5xxxxx\n      |  ^^^^^\n >  6 | 6\n      | ^\n >  7 | 7\n      | ^\n    8 | 8\n    9 | 9\n   10 | 10';
	t.is(rs, exp);

});

test('文件 + 行列', t => {

	let file = './testdata/test1.txt';
	let line = 11;
	let column = 4;

	let rs = codeframe(file, line, column);
	let exp = '    8 | 888\r\n    9 | 999\r\n   10 | aaa\r\n > 11 | bbb let idx = 10;\r\n      |     ^^^^^^^^^^^^^\n   12 | ccc\r\n   13 | ddd\r\n   14 | eee\r';
	t.is(rs, exp);

});

