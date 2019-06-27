const File = require('@gotoeasy/file');
const fs = require('fs');
const execa = require('execa');

const NAME = 'config';
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
    let stdout = execa('gradle', ['clean', 'build', '-x', 'test'], {cwd}).stdout;
    stdout.pipe(process.stdout);
    stdout.unpipe = async function(){

        // 复制jar
        let buildjarfile = `${opts.cwd}/${NAME}/build/libs/${JAR}`;
        let jarfile = `${opts.cwd}/${JAR}`;
        fs.copyFileSync(buildjarfile, jarfile);

        // 写配置文件
        let propertiesfile = `${opts.cwd}/${NAME}.properties`;
        if ( !File.existsFile(propertiesfile) ) {
            File.write(propertiesfile, getProperties());
        }

        // 提示运行命令
        console.info('');
        console.info('etc.');
        console.info(`  java -jar ${JAR}`);
        console.info(`  java -jar ${JAR} --spring.config.location=${NAME}.properties`);
    };

}


function getProperties(){

    return `# 服务名
spring.application.name=config

# 主机
eureka.instance.hostname=localhost
# 端口
server.port=9201

spring.cloud.config.server.git.uri=https://gitee.com/gotoeasy/config.git
spring.cloud.config.server.git.searchPaths=greenwich/**

# 列表上Status的显示格式
eureka.instance.instance-id=\${eureka.instance.hostname}:\${server.port}

# 开启健康检查，用以剔除失效节点
eureka.client.healthcheck.enabled=true
# 注册中心地址
eureka.client.serviceUrl.defaultZone=http://eureka:eureka@localhost:8761/eureka/
`;

}

