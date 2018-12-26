import test from 'ava';
import Err from '.';

test('1 require一个不存在的本地文件', t => {

	function runCompute(){
		try{
			let div = require('./test-div');
			return div(1, 0);
		}catch(e){
			throw Err.cat('my error message', e);
		}
	}

	try{
		console.info( runCompute() );
	}catch(e){
		console.error(e.toString());
	}

	t.is(index > 0, true);

});
