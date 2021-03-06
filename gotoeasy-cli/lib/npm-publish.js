const File = require('@gotoeasy/file');
const Btf = require('@gotoeasy/btf');
const util = require('@gotoeasy/util');
const execa = require('execa');

function publish(opts){

	let filePackageBtf = opts.workDir + '/package.btf';
	let filePackageJson = opts.workDir + '/package.json';

	if (!File.exists(filePackageBtf)){
		console.error('file not found:', filePackageBtf);
		return;
	}

	// package.btf -> package.json
	let btf = new Btf(filePackageBtf);
	let newVersion = getNextVersion(btf, 'version', opts.fixversion);
	let oPackage = {
		name : getLineString(btf, 'name'),
		version : newVersion,
		main : getLineString(btf, 'main'),
		dependencies : getJson(btf, 'dependencies'),
		devDependencies : getJson(btf, 'devDependencies'),
		bin : getJson(btf, 'bin'),
		scripts : getJson(btf, 'scripts'),
		description : getLineString(btf, 'description'),
		keywords : getArray(btf, 'keywords'),
		repository : getJson(btf, 'repository', ['type', 'url']),
		description : getLineString(btf, 'description'),
		homepage : getLineString(btf, 'homepage'),
		bugs : getJson(btf, 'bugs', ['url']),
		author : getJson(btf, 'author', ['name', 'email']),
		license : getLineString(btf, 'license'),
		engines : getJson(btf, 'engines'),
		deprecated : getLineString(btf, 'deprecated'),
	};

	// 删除空属性
	Object.keys(oPackage).forEach(k => util.isEmpty(oPackage[k]) && delete oPackage[k] );
	oPackage.repository && !oPackage.repository.type && !oPackage.repository.url && delete oPackage.repository;
	oPackage.bugs && !oPackage.bugs.url && delete oPackage.bugs;
	oPackage.author && !oPackage.author.name && !oPackage.author.email && delete oPackage.author;

	File.write(filePackageJson, JSON.stringify(oPackage, null, 2))
	console.debug('save file:', filePackageJson);
		
	// update version to package.btf
	let btfText = File.read(filePackageBtf);
	let lines = btfText.split('\r\n');
	let isVer = false;
	for ( let i=0; i<lines.length; i++) {
		if ( isVer && lines[i].trim() ) {
			lines[i] = newVersion;
			break;
		}
		if ( lines[i].substring(0, 9).toLowerCase() == '[version]' ){
			isVer = true;
		}
	}
	File.write(filePackageBtf, lines.join('\r\n') );
	console.debug('save file:', filePackageBtf);

	// npm publish [--access public]
	let sCmd = oPackage.name.startsWith('@') ? "npm publish --access public" : "npm publish"; // 添加参数支持@scope的公有包发布（暂不考虑默认私有包的发布）
    if ( opts.nexttag ) {
        // 发布到 next tag
        sCmd += ' --tag next';   // 使用命令 npm dist-tag add pkg@x.y.z next
    }
	console.info('$> ' + sCmd);
    try{
	    let rs = execa.shellSync(sCmd);
        console.info( rs.stdout );
    }catch(e){
		console.error( e );

		// rollback version to package.btf
		File.write(filePackageBtf, btfText );
		console.info('rollback file:', filePackageBtf);
    }
}

function getNextVersion(btf, name, fix){
	return getLineString(btf, name).split('.').map( (v,i)=> i==2?(fix?v:(v-0+1)):v ).join('.')
}
function getLineString(btf, name){
	return (btf.getText(name) || '').replace(/\r/g, '').replace(/\n/g, '').trim();
}
function getArray(btf, name){
	let txt = (btf.getText(name) || '').trim();
	if ( !txt ) {
		return [];
	}
	return txt.split(',').map(s=>s.trim());
}
function getJson(btf, name, keys){
	let rs = {};
	let map = btf.getMap(name);
	keys ? keys.forEach(k => rs[k] = map.has(k) ? map.get(k) : '')	: map.forEach((v, k) => rs[k] = v);
	return rs;
}


module.exports = publish;
