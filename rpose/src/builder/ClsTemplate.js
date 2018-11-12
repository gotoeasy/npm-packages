// 模板
class Template{
	constructor(tmpl='', argNm) {
		// 模板解析函数（代码数组，模板，前一句是否JS代码）
		let fnParse = function(ary, tmpl, isPreCode){
			let tmp, idx = tmpl.indexOf('<%');
			if ( idx < 0 ){
				// Text
				ary.push(fnText(ary, tmpl, isPreCode)); // 保存解析结果
			} else if ( idx == 0 ){
				if (tmpl.indexOf('<%=') == idx){
					// Value
					tmpl = tmpl.substring(3);
					idx = tmpl.indexOf('%>');
					tmp = tmpl.substring(0, idx);

					ary.push(ary.pop() + "+" + tmp); // 保存解析结果
					fnParse(ary, tmpl.substring(idx+2), false); // 剩余继续解析
				} else {
					// Code
					tmpl = tmpl.substring(2);
					idx = tmpl.indexOf('%>');
					tmp = tmpl.substring(0, idx);

					isPreCode ? ary.push(tmp) : (ary.push(ary.pop() +';') && ary.push(tmp)); // 保存解析结果
					fnParse(ary, tmpl.substring(idx+2), true); // 剩余继续解析
				}

			} else {
				// 取出左边Text
				tmp = tmpl.substring(0, idx);
				ary.push(fnText(ary, tmp, isPreCode)) // 保存解析结果
				fnParse(ary, tmpl.substring(idx), false); // 剩余继续解析
			}
		}
		// 字符串拼接转义函数
		let fnText = function(ary, txt, isPreCode){
			let str = txt.replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\'/g, "\\'");
			return isPreCode? ("s+='" + str + "'") : (ary.pop() + "+'" + str + "'");
		}

        // 创建动态函数toString，使用例子：new Template('Hello <%= data.name %>', 'data').toString({size:20}, {name:'world'})
		let aryBody = [];
		aryBody.push("let s=''")
		fnParse(aryBody, tmpl, true); // 代码数组=aryBody，模板=tmpl，前一句是否JS代码=true
		aryBody.push("return s");
		this.toString = argNm ? new Function(argNm, aryBody.join("\n") ) : new Function(aryBody.join("\n"));
	}
}

module.exports = Template;
