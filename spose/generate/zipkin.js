const os = require('@gotoeasy/os');
const File = require('@gotoeasy/file');
const fs = require('fs');
const download = require('download');
 
module.exports = async function (opts){

    console.info('------------------------------');
    console.info(`    generate zipkin-server`);
    console.info('------------------------------');

    let stime = new Date().getTime();

    let latestVersion = await getLatestVersion();
    let downJar = `${os.homedir()}/.download/zipkin-server-${latestVersion}-exec.jar`;
    let JAR = `zipkin-server-${latestVersion}-exec.jar`;
    let curJar = `${opts.cwd}/${JAR}`;

    if ( !File.existsFile(curJar) ) {
        // 下载jar文件
        if ( !File.existsFile(downJar) ) {
            await downloadJar(downJar);
        }
        // 复制jar文件
        fs.copyFileSync(downJar, curJar);
    }

    // 提示信息
    let time = Math.round( (new Date().getTime() - stime) / 1000 );
    console.info('');
    console.info(`BUILD SUCCESSFUL in ${time}s`);

    console.info('');
    console.info('etc.');
    console.info(`  java -jar ${JAR}`);
    console.info(`  java -jar ${JAR} --STORAGE_TYPE=elasticsearch --ES_HOSTS=http://localhost:9200`);
}

function getLatestVersion(){

    return new Promise((resolve, reject) => {
        download('https://search.maven.org/solrsearch/select?q=g:"io.zipkin.java"+AND+a:"zipkin-server"&rows=1&wt=json').then(data => {
            let fileTmpJson = os.homedir() + '/.download/zipkin-server.json'
            File.write(fileTmpJson, data);
            let oJson = JSON.parse(File.read(fileTmpJson));
            resolve(oJson.response.docs[0].latestVersion); // 版本号
        }).catch(e => {
            resolve('2.12.9');
        });
    });
}

function downloadJar(downJar){

    return new Promise((resolve, reject) => {
        download('https://search.maven.org/remote_content?g=io.zipkin.java&a=zipkin-server&v=LATEST&c=exec').then(data => {
            File.write(downJar, data);
            resolve();
        }).catch(e => {
            reject(e);
        });
    });
}

