const fs = require('fs')
const anymatch = require('anymatch');

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
function mkdir(file) {
	let dirs = file.split(/[/\\]/);
	if(dirs[dirs.length - 1].indexOf('.') >= 0){
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
// matchers: 类似gitignore，*表示不含目录分隔符的任意字符，**表示任意字符含任意多级目录，?表示一个字符
function files(path, ...matchers) {
	if ( matchers.length ) {
		return listFiles(path, matchers);
	}

	let rs = [];
	if( isDirectoryExists(path) ) {
		let ls = fs.readdirSync(path);
		ls.forEach((file, index) => rs.push(path + "/" + file));
	}
	return rs;
};

function listFiles(path, matchers) {

	let matcher = {
		match: function (file){
			let name = file.replace(path + '/', '');
			return anymatch(matchers, name);
		}
	};

	let result = [];
	findFiles(path, matcher, result);
	return result;
};

function findFiles(path, matcher, result){

	let files = fs.readdirSync(path);
	files.forEach( file => {
		let absName = path + "/" + file;
		if ( isFile(absName) ) {
			// 文件，匹配保存
			matcher.match(absName) && result.push(absName);
		}else{
			// 目录，继续找
			findFiles(absName, matcher, result);
		}
	});
}


function isFileExists(file) {
	return isFile(file) && exists(file);
};

function isDirectoryExists(file) {
	return isDirectory(file) && exists(file);
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

module.exports = api;
