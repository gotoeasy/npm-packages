const File = require('@gotoeasy/file');


// 从指定的目录读取过滤后的目标文件，然后按文件名排序，再依次调用require进行装载
// 例：requireAll(__dirname, 'modules/**.js')
module.exports = function requireAll(dir, ...jsFileFilters){

    !jsFileFilters.length && jsFileFilters.push('**.js');   // 默认装载目录含子目录下的全部js文件

    let jsfiles = File.files(dir, ...jsFileFilters);
    jsfiles.sort();

    for ( let i=0,f; f=jsfiles[i++]; ) {
        f.endsWith('.js') && require( f ); // etc. require('D:/foo/bar/baz.js')
    }
}
