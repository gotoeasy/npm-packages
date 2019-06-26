const File = require('@gotoeasy/file');
const fs = require('fs');
const execa = require('execa');

const NAME = 'eureka';
const JAR = `greenwich-${NAME}-1.0.0.jar`;

module.exports = function (opts){

    console.info('------------------------------');
    console.info(`    build greenwich ${NAME}`);
    console.info('------------------------------');

    let dir = File.resolve(__dirname, `../greenwich/${NAME}`);
    let dist = File.resolve(opts.cwd, NAME);

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
    let cwd = `${opts.cwd}/${NAME}`;
    let rs = execa.sync('gradle', ['clean', 'build'], {cwd});
    console.log(rs.stderr || rs.stdout);

    // 复制jar
    let buildjarfile = `${opts.cwd}/${NAME}/build/libs/${JAR}`;
    let jarfile = `${opts.cwd}/${JAR}`;
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
    console.info(`  java -jar ${JAR}`);
    console.info(`  java -jar ${JAR} --spring.config.location=${NAME}.properties`);

}


function getProperties(no){

    return `# 服务名
spring.application.name=eureka

# 主机
eureka.instance.hostname=eureka${no}.server
# 端口
server.port=876${no}

# 简易用户密码保护
spring.security.user.name=eureka
spring.security.user.password=eureka

# 开启健康检查，用以判断注销失效节点
eureka.client.healthcheck.enabled=true
# 关闭自我保护（自我保护：短时间内丢失过多客户端时，会进入自我保护模式，即一个服务长时间没有发送心跳，也不会将其删除）
eureka.server.enable-self-preservation=false
# 注册中心地址
eureka.url1=http://eureka:eureka@eureka1.server:8761/eureka/
eureka.url2=http://eureka:eureka@eureka2.server:8762/eureka/
eureka.url3=http://eureka:eureka@eureka3.server:8763/eureka/
eureka.client.serviceUrl.defaultZone=\${eureka.url1}, \${eureka.url2}, \${eureka.url3}
`;

}

