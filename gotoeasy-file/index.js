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

function files(path) {
	let rs = [];
	if( isDirectoryExists(path) ) {
		let ls = fs.readdirSync(path);
		ls.forEach((file, index) => rs.push(path + "/" + file));
	}
	return rs;
};

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

module.exports = api;
