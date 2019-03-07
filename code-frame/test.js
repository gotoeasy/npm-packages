import test from 'ava';
import codeframe from '.';

test('1文本 + 单一位置 codeframe({text, start})', t => {

	let rs, exp, text, start, end;

	text = `123456781
123456782
123456783
123456784
123456785
123456786
123456787
123456788
123456789
123456780
123456781
123456782
123456783
`;
	
	start = 12;
	rs = codeframe({text, start});
    exp = `   1 | 123456781
 > 2 | 123456782
     |  ^^^^^^^^
   3 | 123456783
   4 | 123456784
   5 | 123456785`;
	t.is(rs, exp);

	
	start = 12;
	end = 1;    // 自动修复为12
	rs = codeframe({text, start, end});
    exp = `   1 | 123456781
 > 2 | 123456782
     |  ^^^^^^^^
   3 | 123456783
   4 | 123456784
   5 | 123456785`;
	t.is(rs, exp);

	// 行数跨2位
	start = 82;
	rs = codeframe({text, start});
    exp = `    6 | 123456786
    7 | 123456787
    8 | 123456788
 >  9 | 123456789
      |  ^^^^^^^^
   10 | 123456780
   11 | 123456781
   12 | 123456782`;

	t.is(rs, exp);

});

test('2文件 + 单一位置 codeframe({file, start})', t => {

	let rs, exp, text, file, start, end;

	file = __dirname + '/testdata.txt'; // 内容同上

	
	start = 12;
	rs = codeframe({file, start});
    exp = `   1 | 123456781
 > 2 | 123456782
     |  ^^^^^^^^
   3 | 123456783
   4 | 123456784
   5 | 123456785`;

	t.is(rs, exp);


	// 行数跨2位
	start = 82;
	rs = codeframe({file, start});
    exp = `    6 | 123456786
    7 | 123456787
    8 | 123456788
 >  9 | 123456789
      |  ^^^^^^^^
   10 | 123456780
   11 | 123456781
   12 | 123456782`;

	t.is(rs, exp);

});


test('3文件 + 开始结束位置 codeframe({file, start, end})', t => {

	let rs, exp, text, file, start, end;

	file = './testdata.txt'; // 内容同上

	
	start = 12;
	end = 15;
	rs = codeframe({file, start, end});
    exp = `   1 | 123456781
 > 2 | 123456782
     |  ^^^^
   3 | 123456783
   4 | 123456784
   5 | 123456785`;

	t.is(rs, exp);


	// 行数跨2位
	start = 82;
	end = 95;
	rs = codeframe({file, start, end});
    exp = `    6 | 123456786
    7 | 123456787
    8 | 123456788
 >  9 | 123456789
      |  ^^^^^^^^
 > 10 | 123456780
      | ^^^^^
   11 | 123456781
   12 | 123456782
   13 | 123456783`;

	t.is(rs, exp);

});


test('4文本 + 指定行列 codeframe({text, line, column})', t => {

	let rs, exp, text, line, column;

	text = `123456781
123456782
123456783
123456784
123456785
123456786
123456787
123456788
123456789
123456780
123456781
123456782
123456783
`;
	
	line = 2;
	column = 2;
	rs = codeframe({text, line, column});
    exp = `   1 | 123456781
 > 2 | 123456782
     |  ^^^^^^^^
   3 | 123456783
   4 | 123456784
   5 | 123456785`;

	t.is(rs, exp);


	// 行数跨2位
	line = 9;
	column = 2;
	rs = codeframe({text, line, column});
    exp = `    6 | 123456786
    7 | 123456787
    8 | 123456788
 >  9 | 123456789
      |  ^^^^^^^^
   10 | 123456780
   11 | 123456781
   12 | 123456782`;

	t.is(rs, exp);

});


test('5文件 + 指定行列 codeframe({file, line, column})', t => {

	let rs, exp, file, text, line, column;

	file = './testdata.txt'; // 内容同上
	
	line = 2;
	column = 2;
	rs = codeframe({file, line, column});
    exp = `   1 | 123456781
 > 2 | 123456782
     |  ^^^^^^^^
   3 | 123456783
   4 | 123456784
   5 | 123456785`;
	t.is(rs, exp);


	line = 2;
	column = 9999;
	rs = codeframe({file, line, column});
    exp = `   1 | 123456781
 > 2 | 123456782
     |         ^
   3 | 123456783
   4 | 123456784
   5 | 123456785`;
	t.is(rs, exp);


	// 行数跨2位
	line = 9;
	column = 2;
	rs = codeframe({file, line, column});
    exp = `    6 | 123456786
    7 | 123456787
    8 | 123456788
 >  9 | 123456789
      |  ^^^^^^^^
   10 | 123456780
   11 | 123456781
   12 | 123456782`;

	t.is(rs, exp);

});


test('6文件 + 指定行列范围 codeframe({file, startLine, startColumn, endLine, endColumn})', t => {

	let rs, exp, file, text, line, column, startLine, startColumn, endLine, endColumn;

	file = './testdata.txt'; // 内容同上
	
	startLine = 2;
	startColumn = 2;
	endLine = 2;
	endColumn = 5;
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = `   1 | 123456781
 > 2 | 123456782
     |  ^^^^
   3 | 123456783
   4 | 123456784
   5 | 123456785`;

	t.is(rs, exp);


	// 行数跨2位
	startLine = 9;
	startColumn = 3;
	endLine = 11;
	endColumn = 5;
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = `    6 | 123456786
    7 | 123456787
    8 | 123456788
 >  9 | 123456789
      |   ^^^^^^^
 > 10 | 123456780
      | ^^^^^^^^^
 > 11 | 123456781
      | ^^^^^
   12 | 123456782
   13 | 123456783`;

	t.is(rs, exp);

});




test('7文件 + 开始结束位置, end过大 codeframe({file, start, end})', t => {

	let rs, exp, text, file, start, end;

	file = './testdata.txt'; // 内容同上

	
	start = 112;
	end = 99999;
	rs = codeframe({file, start, end});
    exp = `    9 | 123456789
   10 | 123456780
   11 | 123456781
 > 12 | 123456782
      |  ^^^^^^^^
 > 13 | 123456783
      | ^^^^^^^^^`;

	t.is(rs, exp);

});


test('8 错误参数 - 文本 + 单一位置 codeframe({text, start})', t => {

	let rs, exp, text, start, end;

	text = `123456781
123456782
123456783
123456784
123456785
123456786
123456787
123456788
123456789
123456780
123456781
123456782
123456783
`;
	
	start = 'xxxxx';
	rs = codeframe({text, start});
    exp = '';
	t.is(rs, exp);

	start = 2;
	end = 'xxxx';
	rs = codeframe({text, start, end});
    exp = '';
	t.is(rs, exp);

	start = 2;
	end = 3;
	rs = codeframe({file:'x:/xxx.xxx', start, end});
    exp = '';
	t.is(rs, exp);

	text = 123;
	start = 1;
	rs = codeframe({text, start});
    exp = '';
	t.is(rs, exp);

});



test('9 错误参数 - 文件 + 指定行列 codeframe({file, line, column})', t => {

	let rs, exp, file, text, line, column;

	file = './testdata.txt'; // 内容同上
	
	line = 'xxx';
	column = 2;
	rs = codeframe({file, line, column});
    exp = ``;
	t.is(rs, exp);

	
	line = 2;
	column = 'xxx';
	rs = codeframe({file, line, column});
    exp = ``;
	t.is(rs, exp);

	
	line = 2;
	column = 2;
	text = true;
	file = true;
	rs = codeframe({text, file, line, column});
    exp = ``;
	t.is(rs, exp);

		
	line = 2;
	column = 2;
	file = true;
	rs = codeframe({file, line, column});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	line = 99999;
	column = 2;
	rs = codeframe({file, line, column});
    exp = ``;
	t.is(rs, exp);


	file = './xxxxxx.xxxx'; // 内容同上
	line = 99999;
	column = 2;
	rs = codeframe({file, line, column});
    exp = ``;
	t.is(rs, exp);

});



test('10 错误参数', t => {

	let rs, exp, file, text, line, column;


	rs = codeframe();
    exp = ``;
	t.is(rs, exp);


	file = 0;
	text = 0;
	line = 1;
	column = 1;
	rs = codeframe({file, text, line, column});
    exp = ``;
	t.is(rs, exp);


	file = './testdata.txt'; // 内容同上
	rs = codeframe({file});
    exp = ``;
	t.is(rs, exp);


});


test('11 错误参数 - 文件 + 指定行列范围 codeframe({file, startLine, startColumn, endLine, endColumn})', t => {

	let rs, exp, file, text, line, column, startLine, startColumn, endLine, endColumn;

	file = './testdata.txt'; // 内容同上
	startLine = 'xxxxxxx';
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	startLine = 1;
	startColumn = 'xxxxxxx';
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	startLine = 1;
	startColumn = 1;
	endLine = 'xxxxxxx';
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	startLine = 1;
	startColumn = 1;
	endLine = 2;
	endColumn = 'xxxxxxx';
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	startLine = -1;
	startColumn = 1;
	endLine = 2;
	endColumn = 2;
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	startLine = 1;
	startColumn = -1;
	endLine = 2;
	endColumn = 2;
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	startLine = 1;
	startColumn = 1;
	endLine = -1;
	endColumn = 2;
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	startLine = 1;
	startColumn = 1;
	endLine = 2;
	endColumn = -1;
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	startLine = 99999;
	startColumn = 1;
	endLine = 2;
	endColumn = 2;
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	startLine = 1;
	startColumn = 99999;
	endLine = 2;
	endColumn = 2;
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	startLine = 1;
	startColumn = 1;
	endLine = 99999;
	endColumn = 2;
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

	file = './testdata.txt'; // 内容同上
	startLine = 1;
	startColumn = 1;
	endLine = 2;
	endColumn = 99999;
	rs = codeframe({file, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

});


test('12 错误参数 - 文件 + 指定行列范围 codeframe({file, startLine, startColumn, endLine, endColumn})', t => {

	let rs, exp, file, text, line, column, startLine, startColumn, endLine, endColumn;

	file = 1;
	
	startLine = 2;
	startColumn = 2;
	endLine = 2;
	endColumn = 5;
	rs = codeframe({file, text, startLine, startColumn, endLine, endColumn});
    exp = ``;
	t.is(rs, exp);

});


test('13 空白缩进整理 - 文本 + 单一位置 codeframe({text, start})', t => {

	let rs, exp, text, start, end;

	text = `                                        123456781
                                        123456782
                                        123456783
                                        123456784
                                        123456785
                                        123456786
                                        123456787
                                        123456788
                                        123456789
                                        123456780
                                        123456781
                                        123456782
                                        123456783
`;
	
	start = 51;
	rs = codeframe({text, start});
    exp = `   1 |                                         123456781
 > 2 |                                         123456782
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   3 |                                         123456783
   4 |                                         123456784
   5 |                                         123456785`;
	t.is(rs, exp);


	start = 91;
	rs = codeframe({text, start});
    exp = `   1 |    123456781
 > 2 |    123456782
     |    ^^^^^^^^^
   3 |    123456783
   4 |    123456784
   5 |    123456785`;
	t.is(rs, exp);

});

test('14 特长转省略号 - 文本 + 单一位置 codeframe({text, start})', t => {

	let rs, exp, text, start, end;

	text = '11111111112222222222333333333344444444445555555555666666666677777777778888888888999999999900000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000';
	
	start = 11;
	end   = 20;
	rs = codeframe({text, start, end});
    exp = ` > 1 | 1111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111 ...
     |           ^^^^^^^^^^`;
	t.is(rs, exp);

});

