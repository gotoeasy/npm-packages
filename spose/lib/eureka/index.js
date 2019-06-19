const File = require('@gotoeasy/file')
const Btf = require('@gotoeasy/btf')
const fs = require('fs')

module.exports = function (opts){

    let btf = new Btf(File.resolve(__dirname, 'template.eureka.greenwich.btf'));
    let oConf = getConfig(opts);

    let file, text;
    let package = oConf['package'];
    let pkgPath = package.replace(/\./g, '/');

    // 启动程序
    text = btf.getText('SpringBootApplication');
    text = text.replace(/%package%/g, package);
    file = `${opts.cwd}/src/main/java/${pkgPath}/EurekaServerApplication.java`;
    File.write(file, text);
    console.log('generate ......', file);

    // 认证程序
    let security = oConf['security.username'] && oConf['security.password'];
    if ( security ) {
        text = btf.getText('WebSecurityConfigurer');
        text = text.replace(/%package%/g, package);
        file = `${opts.cwd}/src/main/java/${pkgPath}/WebSecurityConfigurer.java`;
        File.write(file, text);
        console.log('generate ......', file);
    }

    // 测试程序
    text = btf.getText('SpringBootApplicationTests');
    text = text.replace(/%package%/g, package);
    file = `${opts.cwd}/src/test/java/${pkgPath}/EurekaServerApplicationTests.java`;
    File.write(file, text);
    console.log('generate ......', file);

    // 配置
    text = btf.getText('application.yml');
    text = text.replace(/%service-name%/g, oConf['service-name']);
    text = text.replace(/%server-host%/g, oConf['server-host']);
    text = text.replace(/%server-port%/g, oConf['server-port']);
    text = text.replace(/%username%/g, oConf['security.username']);
    text = text.replace(/%password%/g, oConf['security.password']);
    file = opts.cwd + '/src/main/resources/application.yml';
    File.write(file, text);
    console.log('generate ......', file);

    // 工程类型
    let isGradle = /gradle/i.test(oConf['project-type']);
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
        text = text.replace(/%artifact.group-id%/g, oConf['artifact.group-id']);
        text = text.replace(/%artifact.artifact-id%/g, oConf['artifact.artifact-id']);
        text = text.replace(/%artifact.version%/g, oConf['artifact.version']);
        text = text.replace(/%spring-boot.version%/g, oConf['spring-boot.version']);
        text = text.replace(/%spring-cloud.version%/g, oConf['spring-cloud.version']);
        file = opts.cwd + '/settings.gradle';
        File.write(file, text);
        console.log('generate ......', file);

        // build.gradle
        let ary = [`implementation 'org.springframework.cloud:spring-cloud-starter-netflix-eureka-server'`, `testImplementation 'org.springframework.boot:spring-boot-starter-test'`];
        ary.push(...oConf.dependencies);
        
        let dependencies = [];
        ary.forEach(v => {
            !/spring-boot-starter-security/i.test(v) && !/spring-security-test/i.test(v) && dependencies.push(v);
        });
        if ( security ) {
            dependencies.push(`implementation 'org.springframework.boot:spring-boot-starter-security'`);
            dependencies.push(`testImplementation 'org.springframework.security:spring-security-test'`);
        }
        dependencies = [...new Set(dependencies)];

        text = btf.getText('build.gradle');
        text = text.replace(/%dependencies%/g, dependencies.join('\r\n\t'));
        text = text.replace(/%java.version%/ig, oConf['java.version']);
        file = opts.cwd + '/build.gradle';
        File.write(file, text);
        console.log('generate ......', file);

        console.log();
        console.log('run command to build:  gradle clean build');

    }else{
        // pom.xml
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
        console.log('run command to build:  mvn clean package');
    }

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
        k && !k.startsWith('//') && !v.startsWith('//') && (oRs[k] = v.split(/\s+\/\//)[0].trim());
    });


    oRs.dependencies = (btf.getText('dependencies') || '').split('\n').map(v => v.trim()).filter(v => v && !v.startsWith('//') && (v.indexOf('spring-cloud-starter-netflix-eureka-server')<0) && (v.indexOf('spring-boot-starter-test')<0) );

    return oRs;
}
