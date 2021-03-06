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
            if ( from.endsWith('.java') && opts.package ) {
                // src/main/java/top/gotoeasy/cloud/eureka/
                let pkg = opts.package || 'top.gotoeasy.cloud.eureka';
                let to = dist + from.substring(dir.length);

                to = to.replace('/src/main/java/top/gotoeasy/cloud/eureka', '/src/main/java/' + pkg.replace(/\./g, '/')); // 按包名替换目录
                File.mkdir(to);

                let src = File.read(from);
                src = src.replace(/package\s+top.gotoeasy.cloud.eureka/, 'package ' + pkg); // 替换包名
                File.write(to, src);

            }else{
                let to = dist + from.substring(dir.length);
                File.mkdir(to);
                fs.copyFileSync(from, to);
            }
        });
    }

    if ( !opts.build ) return;

    // 编译
    let cwd = `${opts.cwd}/${NAME}`;
    let stdout = execa('gradle', ['clean', 'build', '-x', 'test'], {cwd}).stdout;
    stdout.pipe(process.stdout);
    stdout.unpipe = async function(){

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

        // 清除
        execa.sync('gradle', ['clean'], {cwd});

        // 提示运行命令
        console.info('');
        console.info('etc.');
        console.info(`  java -jar ${JAR}`);
        console.info(`  java -jar ${JAR} --spring.config.location=${NAME}.properties`);
    };

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

# 支持actuator监控
management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always

# 开启健康检查，用以判断注销失效节点
eureka.client.healthcheck.enabled=true
# 注册中心地址
eureka.url1=http://eureka:eureka@eureka1.server:8761/eureka/
eureka.url2=http://eureka:eureka@eureka2.server:8762/eureka/
eureka.url3=http://eureka:eureka@eureka3.server:8763/eureka/
eureka.client.serviceUrl.defaultZone=\${eureka.url1}, \${eureka.url2}, \${eureka.url3}
`;

}

