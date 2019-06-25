const File = require('@gotoeasy/file');
const fs = require('fs');
const execa = require('execa');

module.exports = function (opts){

    console.info('------------------------------');
    console.info('    build greenwich-config');
    console.info('------------------------------');

    let dir = File.resolve(__dirname, '../greenwich/config');
    let dist = File.resolve(opts.cwd, 'config');

    // 复制源文件
    if ( !File.existsFile(dist + '/build.gradle') ) {
        // 不覆盖，便于手动修改
        let files = File.files(dir, '**');
        files.forEach(from => {
            let to = dist + from.substring(dir.length);
            File.mkdir(to);
            fs.copyFileSync(from, to);
        });
    }

    // 编译
    let cwd = opts.cwd + '/config';
    let rs = execa.sync('gradle', ['clean', 'build'], {cwd});
    console.log(rs.stderr || rs.stdout);

    // 复制jar
    let buildjarfile = opts.cwd + '/config/build/libs/greenwich-config-1.0.0.jar';
    let jarfile = opts.cwd + '/greenwich-config-1.0.0.jar';
    fs.copyFileSync(buildjarfile, jarfile);

    // 写配置文件
    if ( !File.existsFile(opts.cwd + '/config.properties') ) {
        File.write(opts.cwd + '/config.properties', getProperties(1));
    }

    // 提示运行命令
    console.info('');
    console.info('etc.');
    console.info('  java -jar greenwich-config-1.0.0.jar');
    console.info('  java -jar greenwich-config-1.0.0.jar --spring.config.location=config.properties');

}


function getProperties(){

    return `# 服务名
spring.application.name=greenwich-config

# 主机
eureka.instance.hostname=localhost
# 端口
server.port=9101

spring.cloud.config.server.git.uri=https://gitee.com/gotoeasy/config.git
spring.cloud.config.server.git.searchPaths=greenwich/**

# 列表上Status的显示格式
eureka.instance.instance-id=\${eureka.instance.hostname}:\${server.port}

# 注册中心地址
eureka.client.serviceUrl.defaultZone=http://eureka:eureka@localhost:8761/eureka/
`;

}

