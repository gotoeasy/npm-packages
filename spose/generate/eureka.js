const File = require('@gotoeasy/file');
const fs = require('fs');
const execa = require('execa');

module.exports = function (opts){

    console.info('------------------------------');
    console.info('    build eureka-greenwich');
    console.info('------------------------------');

    let dir = File.resolve(__dirname, '../greenwich/eureka');
    let dist = File.resolve(opts.cwd, 'eureka');

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
    let cwd = opts.cwd + '/eureka';
    let rs = execa.sync('gradle', ['clean', 'build'], {cwd});
    console.log(rs.stderr || rs.stdout);

    // 复制jar
    let buildjarfile = opts.cwd + '/eureka/build/libs/eureka-greenwich-1.0.0.jar';
    let jarfile = opts.cwd + '/eureka-greenwich-1.0.0.jar';
    fs.copyFileSync(buildjarfile, jarfile);

    // 写配置文件
    if ( !File.existsFile(opts.cwd + '/eureka-peer1.properties') ) {
        File.write(opts.cwd + '/eureka-peer1.properties', getProperties(1));
        File.write(opts.cwd + '/eureka-peer2.properties', getProperties(2));
        File.write(opts.cwd + '/eureka-peer3.properties', getProperties(3));
    }

    // 提示运行命令
    console.info('');
    console.info('etc.');
    console.info('  java -jar eureka-greenwich-1.0.0.jar');
    console.info('  java -jar eureka-greenwich-1.0.0.jar --spring.config.location=eureka-peer1.properties');

}


function getProperties(no){

    return `# 主机
eureka.instance.hostname=eureka${no}.server
# 端口
server.port=876${no}

# 简易用户密码保护
spring.security.user.name=eureka
spring.security.user.password=eureka

# 注册中心地址
eureka.url1=http://eureka:eureka@eureka1.server:8761/eureka/
eureka.url2=http://eureka:eureka@eureka2.server:8762/eureka/
eureka.url3=http://eureka:eureka@eureka3.server:8763/eureka/
eureka.client.serviceUrl.defaultZone=\${eureka.url1}, \${eureka.url2}, \${eureka.url3}
`;

}

