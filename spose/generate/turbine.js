const File = require('@gotoeasy/file');
const fs = require('fs');
const execa = require('execa');

const NAME = 'turbine';
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

        // 清除
        execa.sync('gradle', ['clean'], {cwd});

        // 提示运行命令
        console.info('');
        console.info('etc.');
        console.info(`  java -jar ${JAR}`);
        console.info(`  java -jar ${JAR} --spring.config.location=${NAME}.properties`);
    };

}


function getProperties(){

    return `# 服务名
spring.application.name=turbine

# 从serviceId指定的服务读取配置，本例配置文件： turbine-dev.properties
spring.cloud.config.discovery.enabled=true
spring.cloud.config.discovery.serviceId=config
spring.cloud.config.profile=dev

# 端口
server.host=localhost
server.port=9901

# 不需要向注册中心注册
eureka.client.register-with-eureka=false

# 注册中心地址
eureka.client.serviceUrl.defaultZone=http://eureka:eureka@eureka.server:8761/eureka/
`;

}

