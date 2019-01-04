import test from 'ava';
import Btf from '.';

test('BTF读取解析字符串测试', t => {


	let btf = new Btf('', true);
	let doc1 = btf.getDocument();
	t.not(doc1, null);
	t.is(doc1.getText('key1'), undefined);


	btf = new Btf('[k]\r\nv', true);
	t.is(btf.getText('k'), 'v');


	btf = new Btf('================text======', true);
	t.is(btf.getText('k'), undefined);

	btf = new Btf('[k]', true);
	t.is(btf.getText('k'), '');


	btf = new Btf('[k]\nv', true);
	t.is(btf.getText('k'), 'v');

	btf = new Btf('[k]\nv\n', true);
	t.is(btf.getText('k'), 'v\n');

	btf = new Btf('[]\n0', true);
	t.is(btf.getText(''), '0');
	btf = new Btf('[]]\n1', true);
	t.is(btf.getText(''), '1');
	btf = new Btf('[\\]]\n2', true);
	t.is(btf.getText(']'), '2');
	btf = new Btf('[\\]\\]]\n3', true);
	t.is(btf.getText(']]'), '3');
	btf = new Btf('[[\\]]\n4', true);
	t.is(btf.getText('[]'), '4');
	btf = new Btf('[\\]\n5', true);
	t.is(btf.getText('\\'), '5');

});



test('BTF读取文件测试', t => {


	let btf = new Btf('testdata/test1.btf');
	t.is(btf.getDocuments().length, 4);

	t.is(btf.getText('key1'), 'value1');
	t.is(btf.getText('key2'), 'value2\r\n');
	t.is(btf.getText('key-value'), 'k1 : v1\r\nk2 = v2\r\nk3 : =v3\r\nk4 = :v4\r\n');
	t.is(btf.getText('key3'), undefined);
	let doc1 = btf.getDocument();
	t.is(doc1.getText('key1'), 'value1');
	t.is(doc1.getText('key2'), 'value2\r\n');
	t.is(doc1.getMap('key1').size, 0);

	let map = btf.getMap('key-value');
	t.is(map.get('k1'), 'v1');
	t.is(map.get('k2'), 'v2');
	t.is(map.get('k3'), '=v3');
	t.is(map.get('k4'), ':v4');
	t.is(btf.getMap('xxx').size, 0);
	
	let doc2 = btf.getDocuments()[1];
	t.is(doc2.getText('name1'), '111');
	t.is(doc2.getText('name2'), '222\r\n');

	let doc3 = btf.getDocuments()[2];
	t.is(doc3.getText('C1'), 'V1\r\n---------\r\n----------\r\n[C0]');
	t.is(doc3.getText('C2'), '=========');
	t.is(doc3.getText('C3'), undefined);
	t.is(doc3.getText(''), '');

	let doc4 = btf.getDocuments()[3];
	t.is(doc4.getText(''), '');
	t.is(doc4.getText(']'), ']');
	t.is(doc4.getText(']]'), ']]');

});


test('BTF读取文件测试', t => {

    let btf;
	btf = new Btf('[\\]\nabc', true);
	t.is(btf.getText('\\'), 'abc');

	btf = new Btf('[\\\\]\nabc', true);
	t.is(btf.getText('\\\\'), 'abc');

	btf = new Btf('[\\\\]]\nabc', true);
	t.is(btf.getText('\\]'), 'abc');

	btf = new Btf('[\\\\\\]]\nabc', true);
	t.is(btf.getText('\\\\]'), 'abc');

	btf = new Btf('[\\\\\\]\\]\nabc', true);
	t.is(btf.getText('\\\\]\\'), 'abc');

	btf = new Btf('[\\\\\\]\\]]]]]]]]\nabc', true);
	t.is(btf.getText('\\\\]]'), 'abc');

});
