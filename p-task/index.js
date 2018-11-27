const hash = require('string-hash');
/*
function hash(str){
	let rs = 5381, i = str.length;
	while ( i ) {
		rs = (rs * 33) ^ str.charCodeAt(--i);
	}
	return rs >>> 0;
}
*/


module.exports = function PTask(fnTaskGetter){
	let pResult = new Map();

	this.start = (...args) => {
		// 重复调用start时，仅第一次调用实际执行，并共用该结果
		let hashCode = hash(JSON.stringify(args));
		let rs = pResult.get(hashCode);
		if ( !rs ) {
			// 首次调用优先（后面调用返回首次结果）
			rs = { state: 0, isBroken: ()=>!!rs.state };
			rs.promise = new Promise((resolve, reject) => {
				rs.resolve = resolve;
				rs.reject = reject;
			});
			pResult.set(hashCode, rs);

			// 延后状态判断，尽量只调用函数一次
			Promise.resolve().then( async ()=>{
				let fnTask = fnTaskGetter(rs.resolve, rs.reject, rs.isBroken);
				await fnTask(...args); // 执行
			});
		}
		return rs.promise;
	};

	this.restart =  (...args) => {
		// 重复调用restart时，仅最后一次调用实际执行，并共用该结果
		let hashCode = hash(JSON.stringify(args));
		let rs = pResult.get(hashCode);

		if ( rs ) {
			rs.state = 1; // 打断(重做)
		}

		// 重新开始
		pResult.delete(hashCode);
		let promise = this.start(...args);
		
		if ( rs ) {
			// 末次调用优先（前面调用返回末次结果）
			rs.resolve( promise );
		}

		return promise;
	};

	this.cancel = (...args) => {
		let rs = pResult.get( hash(JSON.stringify(args)) );
		if ( rs && rs.state != -1) {
			rs.reject('canceled');
			rs.state = -1; // 打断(取消)
		}

		return rs ? rs.promise : undefined;
	};

}

