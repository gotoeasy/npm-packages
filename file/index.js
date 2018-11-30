const fs = require('fs')

// 按指定编码写文件
// file为对象时，取属性使用：path、file、text、encoding
function write(file, text='', encoding='utf-8') {
	if (file && file.file) {
		let pathFile = file.path ? file.path + '/' + file.file : file.file;
		return write(pathFile, file.text, file.encoding)
	}else{
		mkdir(file);
		fs.writeFileSync(file, text, encoding);
	}
}

// 按指定编码读文件
function read(file, encoding='utf-8') {
	return fs.readFileSync(file, encoding);
}

// 创建指定目录（或指定文件所在的目录）
function mkdir(file, ignorePoint) {
	let dirs = file.split(/[/\\]/);
	if(!ignorePoint && dirs[dirs.length - 1].indexOf('.') >= 0){
		dirs.length = dirs.length -1;
	}

	let path;
	for(let i = 0; i < dirs.length; i++){
		if (i==0) {
			path = dirs[i] ;
		}else{
			path += '/' + dirs[i] ;
		}

		if (!fs.existsSync(path)) {
			fs.mkdirSync(path, err=>console.error(err))
		}
	}
}

// 删除文件或目录（含子目录及文件）
function remove(path) {
	let files = [];
	if( fs.existsSync(path) ) {
		if(fs.statSync(path).isFile()){
			fs.unlinkSync(path);
			return;
		}

		files = fs.readdirSync(path);
		files.forEach(function(file, index){
			let curPath = path + "/" + file;
			if(fs.statSync(curPath).isDirectory()) {
				remove(curPath)
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path, err=>console.error(err));
	}
};

// 不传matchers时不查询子目录
// matchers: 匹配规则
// [?]  - 单一字符
// [*]  - 除目录分隔符[/]以外的任意字符
// [**] - 任意字符
// [!]  - 感叹号开头时表示排除
function files(path, ...matchers) {
	if ( matchers.length ) {
		return listFiles(path.replace(/\\/g, '/'), matchers);
	}

	let rs = [];
	if( isDirectoryExists(path) ) {
		let ls = fs.readdirSync(path);
		ls.forEach((file, index) => rs.push(path + "/" + file));
	}
	return rs;
}

function listFiles(path, matchers) {
	//console.info(path, matchers)
	let result = [];
	findFiles(path, getMatcher(path, matchers), result);
//console.info('gotoeasy-file----------result-------', result)
	return result;
}

function getMatcher(path, matchers){

	let includes = [];
	let excludes = [];
	for ( let i=0; i<matchers.length; i++ ) {
		let match = matchers[i].replace(/\\/g, '/').trim();
		let isExclude = false;
		let isDir = false;
		if ( match.startsWith('!') ) {
			isExclude = true;
			match = match.substring(1);
		}
		if ( match.startsWith('/') ) {
			match = match.substring(1);  // 开始字符是目录分隔符的话，总是去掉
		}
		if ( match.endsWith('/') ) {
			isDir = true;
			match = match.substring(0, match.length-1);  // 结束字符是目录分隔符的话，总是去掉
		}
		if ( match == '' ) {
			continue;
		}

		let reg = {
			isDir: isDir,
			reg: new RegExp(convert(match))
		}
		isExclude ? excludes.push(reg) : includes.push(reg);
	}

	let matcher = (file, isDir) => {
		let target = file.replace(/\\/g, '/');
		if ( !target.startsWith(path) ) {
			return false;
		}
		target = target.substring(path.length);
		if ( target.startsWith('/') ) {
			target = target.substring(1);  // 开始字符是目录分隔符的话，总是去掉
		}
		let match;

		// 排除规则先做
		for ( let i=0; i<excludes.length; i++ ) {
			match = excludes[i];
			if ( match.reg.test(target) ) { // 匹配
				if ( match.isDir ) {
					if ( isDir ) {
						return false; // 当前是目录,是排除对象
					}
				}else{
					return false; // 排除的文件或目录
				}
			}
		}

		// 匹配规则后做
		for ( let i=0; i<includes.length; i++ ) {
			match = includes[i];
//console.info('gotoeasy-file--------match---------', match, target)
			if ( match.reg.test(target) ) { // 只要文件，不用考虑目录，直接匹配
				return true;
			}
		}

		if ( isDir ) {
			return true; // 目录,继续找
		}
		return false;
	};

	return matcher;
}

function convert(match){
	// [?]  - 单一字符
	// [*]  - 除目录分隔符[/]以外的任意字符
	// [**] - 任意字符
	let reg = match;

	reg = reg.replace(/\^/g, '\\^');
	reg = reg.replace(/\$/g, '\\$');
	reg = reg.replace(/\./g, '\\.');
	reg = reg.replace(/\+/g, '\\+');
	reg = reg.replace(/\-/g, '\\-');
	reg = reg.replace(/\=/g, '\\=');
	reg = reg.replace(/\!/g, '\\!');
	reg = reg.replace(/\(/g, '\\(');
	reg = reg.replace(/\)/g, '\\)');
	reg = reg.replace(/\[/g, '\\[');
	reg = reg.replace(/\]/g, '\\]');
	reg = reg.replace(/\{/g, '\\{');
	reg = reg.replace(/\}/g, '\\}');
	reg = reg.replace(/\//g, '\\/');

	reg = reg.replace(/\?/g, '.');			// [.]  - 单个问号，替换为查找单个字符
	reg = reg.replace(/\*{2,}/g, '\\S\\n');	// [\S] - 两个以上星号，替换为查找非空白字符
	reg = reg.replace(/\*{1}/g, '[^/]*');	// [^/] - 单个星号，替换为查找目录分隔符[/]以外的任意字符

	reg = reg.replace(/\\n/g, '*');

	reg = '^' + reg + '$';
//console.info('gotoeasy-file--------reg---------', reg)
	return reg;
}

function findFiles(path, matcher, result){

	let files = fs.readdirSync(path);
	files.forEach( file => {
		let absName = path + "/" + file;
		if ( isFile(absName) ) {
//console.info('gotoeasy-file--------absName---------', absName)
			// 文件，匹配保存
			matcher(absName) && result.push(absName);
		}else{
			// 目录，继续找
			matcher(absName, true) && findFiles(absName, matcher, result);
		}
	});
}


function isFileExists(file) {
	return exists(file) && isFile(file);
};

function isDirectoryExists(file) {
	return exists(file) && isDirectory(file);
};

function isFile(file) {
	return fs.statSync(file).isFile();
};

function isDirectory(file) {
	return fs.statSync(file).isDirectory();
};

function exists(file) {
	return fs.existsSync(file);
};

function concat(path, handle) {
	let rs = files(path);
	rs.sort();

	if ( handle ) {
		handle(rs); // 有回调函数时交由该函数处理
		return;
	}

	// 默认合并全部文件内容返回
	let ary = [];
	rs.forEach(f=>isFile(f) && ary.push(read(f)));
	return ary.join('\r\n');
};


// ---------------------------------
function readPromise(file, defaultContent){
	return new Promise(function(resolve, reject){
		if ( exists(file) ) {
			fs.readFile(file, 'utf-8', (err, data) => err ? reject(err) : resolve(data));
		}else{
			defaultContent === undefined ? reject('file not found: ' + file) : resolve(defaultContent);
		}
	});
}
function writePromise(file, content){
	return new Promise(function(resolve, reject){
		mkdir(file);
		fs.writeFile(file, content, 'utf-8', (err, data) => err ? reject(err) : resolve(data));
	});
}


// 导出接口
let api = {};
api.write = write;
api.read = read;
api.isFileExists = isFileExists;
api.isDirectoryExists = isDirectoryExists;
api.isFile = isFile;
api.isDirectory = isDirectory;
api.isDir = isDirectory;
api.exists = exists;
api.existsFile = isFileExists;
api.existsDir = isDirectoryExists;
api.files = files;
api.mkdir = mkdir;
api.md = mkdir;
api.remove = remove;
api.rm = remove;
api.del = remove;
api.concat = concat;

api.readPromise = readPromise;
api.writePromise = writePromise;

module.exports = api;
