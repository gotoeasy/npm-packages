const Err = require('@gotoeasy/err');
const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');
const fs = require('fs');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// ----------------------------------------------
// 输出页面代码文件
// ----------------------------------------------
bus.on('输出页面代码文件', function(){

	return async function(srcFile){
	
		let htmlFile;
		try{
			let allrequires = await bus.at('查找页面依赖组件', srcFile);
//console.error(MODULE, '------------allrequires------------', allrequires);
			await Promise.all( [bus.at('输出页面JS文件', srcFile, allrequires), bus.at('输出页面CSS文件', srcFile, allrequires)]  );
			
			htmlFile = await bus.at('输出页面HTML文件', srcFile);

			bus.at('页面编译状态', htmlFile, true);
		}catch(e){
			//bus.at('页面编译状态', htmlFile || srcFile, false);
			throw Err.cat(MODULE + 'write page failed', htmlFile || srcFile, e);
		}

	}; 


}());


// ----------------------------------------------
// 输出页面代码文件 --- js
// ----------------------------------------------
bus.on('输出页面JS文件', function(){

	// 异步输出页面JS文件
	return async function(srcFile, allrequires){

		let jsFile = bus.at('页面目标JS文件名', srcFile);
		try{
			let source = await bus.at('汇总页面关联JS代码', srcFile, allrequires);
			await File.writePromise(jsFile, source);
		}catch(e){
			throw Err.cat(MODULE + 'write page js failed', srcFile, e);
		}
	}; 


}());


// ----------------------------------------------
// 输出页面代码文件 --- css
// ----------------------------------------------
bus.on('输出页面CSS文件', function(){

	// 异步输出页面CSS文件
	return async function(srcFile, allrequires){

		let cssFile = bus.at('页面目标CSS文件名', srcFile);
		try{
			let source = await bus.at('汇总页面关联CSS代码', srcFile, allrequires);
			await File.writePromise(cssFile, source);
		}catch(e){
			throw Err.cat(MODULE + 'write page css failed', srcFile, e);
		}

	};


}());


// ----------------------------------------------
// 输出页面代码文件 --- html
// ----------------------------------------------
bus.on('输出页面HTML文件', function(){


	// 异步输出页面HTML文件
	return async function(srcFile){


		let htmlFile = bus.at('页面目标HTML文件名', srcFile);
		try{
			let env = bus.at('编译环境');
			let name = htmlFile.substring(env.path.build.length + 1);
			let source = await bus.at('生成页面HTML代码', srcFile);

			return new Promise((resolve, reject) => {
				fs.writeFile(htmlFile, source, (err, data) => {
					err ? reject(err) : resolve(name);
				});
			});
		}catch(e){
			throw Err.cat(MODULE + 'write page html failed', srcFile, e)
		}

	};


}());
