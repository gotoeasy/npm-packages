import test from 'ava';
import bus from '.';

test('安装、使用、卸载、清除', t => {

	function add(a, b){
		return a + b;
	}
	function add2(a, b, c=1000){
		return a + b + c;
	}

	// 重复安装时仅一个生效
	bus.on('add', add);
	bus.on('add', add);
	bus.on('add', add);
	bus.on('add', add2);

	bus.on('乘法', function(a, b){
		return a * b;
	});

	t.is(bus.at('add', 1, 2), 3);
	bus.off('add', add);
	t.is(bus.at('add', 1, 2), 1003);
	bus.off('add', add2);
	t.is(bus.at('add', 1, 2), undefined);

	t.is(bus.at('乘法', 3, 3), 9);
	bus.off('乘法');
	t.is(bus.at('乘法', 3, 3), undefined);


	bus.once('add', add);
	bus.on('add', add2);
	t.is(bus.at('add', 1, 2), 3);
	t.is(bus.at('add', 1, 2), 1003);
	bus.clear();
	t.is(bus.at('add'), undefined);

	bus.once('add', add);
	bus.once('add', add2);
	t.is(bus.at('add', 1, 2), 3);
	t.is(bus.at('add', 1, 2), undefined);


	bus.on('add', 11111);
	t.is(bus.at('add', 1, 2), undefined);

	bus.once('add', add);
	bus.off('add', 11111);
	bus.off('xxxx');
	t.is(bus.at('add', 1, 2), 3);

});
