const File = require('@gotoeasy/file')
const Btf = require('@gotoeasy/btf')
const execa = require('execa');
const fs = require('fs');

module.exports = function (opts){

    let btf = new Btf(File.resolve(__dirname, 'template.eureka.greenwich.btf'));
    let oConf = getConfig(opts);

    let file, text;
    let pkg = oConf['artifact.group-id'];
    let pkgPath = pkg.replace(/\./g, '/');

    // 启动程序
    text = btf.getText('SpringBootApplication');
    text = text.replace(/%package%/g, pkg);
    file = `${opts.cwd}/src/main/java/${pkgPath}/eureka/EurekaServerApplication.java`;
    File.write(file, text);
    console.log('generate ......', file);

    // 测试程序
    text = btf.getText('SpringBootApplicationTests');
    text = text.replace(/%package%/g, pkg);
    file = `${opts.cwd}/src/test/java/${pkgPath}/eureka/EurekaServerApplicationTests.java`;
    File.write(file, text);
    console.log('generate ......', file);

    // 配置
    text = btf.getText('application.yml');
    text = text.replace(/%service-name%/g, oConf['service-name']);
    text = text.replace(/%server-host%/g, oConf['server-host']);
    text = text.replace(/%server-port%/g, oConf['server-port']);
    file = opts.cwd + '/src/main/resources/application.yml';
    File.write(file, text);
    console.log('generate ......', file);

    // pom.xml
    let groupId = oConf['artifact.group-id'];
    let artifactId = oConf['artifact.artifact-id'];
    let version = oConf['artifact.version'];

    text = btf.getText('pom.xml');
    text = text.replace(/%java.version%/g, oConf['java.version']);

    text = text.replace(/%artifact.group-id%/g, oConf['artifact.group-id']);
    text = text.replace(/%artifact.artifact-id%/g, oConf['artifact.artifact-id']);
    text = text.replace(/%artifact.version%/g, oConf['artifact.version']);

    text = text.replace(/%spring-boot.version%/g, oConf['spring-boot.version']);
    text = text.replace(/%spring-cloud.version%/g, oConf['spring-cloud.version']);

    file = opts.cwd + '/pom.xml';
    File.write(file, text);
    console.log('generate ......', file);

    // 打包
    let sCmd = 'mvn clean package';
	console.log('$> ' + sCmd);

    try{
        let rs = execa.shellSync(sCmd);
        if ( rs.stderr ) {
            throw rs.stderr;
        }
	    console.log(rs.stdout);
    }catch(e){
        throw e;
    }

/*
    file = `${opts.cwd}/${oConf['artifact.artifact-id']}-${oConf['artifact.version']}.jar`;
    File.remove(file);
    fs.renameSync(`${opts.cwd}/target/${oConf['artifact.artifact-id']}-${oConf['artifact.version']}.jar`, file);
    File.remove(`${opts.cwd}/target`);
    console.log(file);
*/

};

function getConfig(opts){

    let fileConfDefault = File.resolve(__dirname, 'spose.eureka.config.btf');
    let fileConfInput = File.resolve(opts.cwd, 'spose.eureka.config.btf');
    if ( !File.existsFile(fileConfInput) ) {
        fs.copyFileSync(fileConfDefault, fileConfInput);    // 无配置文件时，默认复制一份便于确认
    }

    let oDefault = getBtfConfig(fileConfDefault);
    let oInput = getBtfConfig(fileConfInput);
    return Object.assign(oDefault, oInput);
}

function getBtfConfig(file){
    let oRs = {};
    if ( !File.existsFile(file) ) {
        return oRs;
    }

    let btf = new Btf(file);
    btf.getMap('settings').forEach((v, k) => {
        k && !k.startsWith('//') && (oRs[k] = v.split('//')[0].trim());
    });
    return oRs;
}
