const bus = require('@gotoeasy/bus');
const File = require('@gotoeasy/file');

module.exports = bus.on('import-svgicons', function(){

    // 导入svf图标文件，参数是文件或目录
	return (...files) => {
        let ary = [];
        files.forEach( f => ary.push(File.resolve(process.cwd(), f)) );
        return bus.at('svgicons-normalize-to-svg-data', ...ary);
    };

}());

