const File = require('@gotoeasy/file')
const Btf = require('@gotoeasy/btf')
const fs = require('fs')

module.exports = function (opts){

    let btf = new Btf(File.resolve(__dirname, 'template.service.greenwich.btf'));
    let oConf = getConfig(opts);

    let file, text;
    let package = oConf['package'];
    let pkgPath = package.replace(/\./g, '/');

    // 启动程序
    text = btf.getText('SpringBootApplication');
    text = text.replace(/%package%/g, package);
    file = `${opts.cwd}/src/main/java/${pkgPath}/RedisServiceApplication.java`;
    File.write(file, text);
    console.log('generate ......', file);

    // Service
    text = btf.getText('Service');
    text = text.replace(/%package%/g, package);
    file = `${opts.cwd}/src/main/java/${pkgPath}/service/RedisService.java`;
    File.write(file, text);
    console.log('generate ......', file);

    // Controller
    text = btf.getText('Controller');
    text = text.replace(/%package%/g, package);
    file = `${opts.cwd}/src/main/java/${pkgPath}/controller/RedisController.java`;
    File.write(file, text);
    console.log('generate ......', file);

    // 测试程序
    text = btf.getText('SpringBootApplicationTests');
    text = text.replace(/%package%/g, package);
    file = `${opts.cwd}/src/test/java/${pkgPath}/RedisServiceApplicationTests.java`;
    File.write(file, text);
    console.log('generate ......', file);

    // 配置
    text = btf.getText('application.yml');
    text = text.replace(/%service-name%/g, oConf['service-name']);
    text = text.replace(/%server-port%/g, oConf['server-port']);
    text = text.replace(/%register-center-url%/g, oConf['register-center-url']);

    text = text.replace(/%redis-host%/g, oConf['redis-host']);
    text = text.replace(/%redis-port%/g, oConf['redis-port']);
    text = text.replace(/%redis-password%/g, oConf['redis-password']);

    file = opts.cwd + '/src/main/resources/application.yml';
    File.write(file, text);
    console.log('generate ......', file);


    // 工程类型
    let isGradle = true; // /gradle/i.test(oConf['project-type']);
    if ( isGradle ) {
        // gradle.properties
        text = btf.getText('gradle.properties');
        text = text.replace(/%artifact.group-id%/g, oConf['artifact.group-id']);
        text = text.replace(/%artifact.artifact-id%/g, oConf['artifact.artifact-id']);
        text = text.replace(/%artifact.version%/g, oConf['artifact.version']);
        text = text.replace(/%spring-boot.version%/g, oConf['spring-boot.version']);
        text = text.replace(/%spring-cloud.version%/g, oConf['spring-cloud.version']);
        file = opts.cwd + '/gradle.properties';
        File.write(file, text);
        console.log('generate ......', file);

        // settings.gradle
        text = btf.getText('settings.gradle');
        file = opts.cwd + '/settings.gradle';
        File.write(file, text);
        console.log('generate ......', file);

        // build.gradle
        text = btf.getText('build.gradle');
        text = text.replace(/%dependencies%/g, oConf.dependencies);
        text = text.replace(/%java.version%/ig, oConf['java.version']);
        file = opts.cwd + '/build.gradle';
        File.write(file, text);
        console.log('generate ......', file);

        console.log();
        console.log('run command to build:  gradle clean build');

    }else{
        // pom.xml
/*
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

        console.log();
        console.log('run mvn clean package to build');
*/
    }

};

function getConfig(opts){

    let fileConfDefault = File.resolve(__dirname, 'spose.service.config.btf');
    let fileConfInput = File.resolve(opts.cwd, 'spose.service.config.btf');
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
        k && !k.startsWith('//') && (oRs[k] = v.split(/\s+\/\//)[0].trim());
    });

    let dependencies = (btf.getText('dependencies') || '').split('\n').map(v => v.trim()).filter(v => v && !v.startsWith('//'));
    oRs.dependencies = dependencies.length ? dependencies.join('\r\n\t') : '';

    return oRs;
}
