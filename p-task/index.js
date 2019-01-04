const hash = require('@gotoeasy/hash');

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

			// 延后执行，尽量只调用一次
			setTimeout(async ()=>{
				if ( !rs.isBroken() ) {
					let fnTask = fnTaskGetter(rs.resolve, rs.reject, rs.isBroken);
					try{
						await fnTask(...args);	// 执行
						rs.resolve();			// 避免执行函数漏调用resolve
					}catch(e){
						rs.reject(e);
					}
				}
			});
		}
		return rs.promise;
	};

	this.restart =  (...args) => {
		// 重复调用restart时，仅最后一次调用实际执行，并共用该结果
		let hashCode = hash(JSON.stringify(args));
		let rs = pResult.get(hashCode);

		if ( rs ) {
			rs.state = 1; // 打断(重做)，如果没有完成则可以通过isBroken得知已被打断
		}

		// 重新开始
		pResult.delete(hashCode);
		let promise = this.start(...args);
		
		if ( rs ) {
			// 末次调用优先（前面调用返回末次结果），如果已完成则修改无效
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

