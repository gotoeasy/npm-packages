/*
less\lib\less\contexts.js

	// options
    'paths',            // option - unmodified - paths to search for imports on
    'rewriteUrls',      // option - whether to adjust URL's to be relative
    'rootpath',         // option - rootpath to append to URL's
    'strictImports',    // option -
    'insecure',         // option - whether to allow imports from insecure ssl hosts
    'dumpLineNumbers',  // option - whether to dump line numbers
    'compress',         // option - whether to compress
    'syncImport',       // option - whether to import synchronously
    'chunkInput',       // option - whether to chunk input. more performant but causes parse issues.
    'mime',             // browser only - mime type for sheet import
    'useFileCache',     // browser only - whether to use the per file session cache
    // context
    'processImports',   // option & context - whether to process imports. if false then imports will not be imported.
                        // Used by the import manager to stop multiple import visitors being created.
    'pluginManager'     // Used as the plugin manager for the session


    'paths',             // additional include paths
    'compress',          // whether to compress
    'ieCompat',          // whether to enforce IE compatibility (IE8 data-uri)
    'math',              // whether math has to be within parenthesis
    'strictUnits',       // whether units need to evaluate correctly
    'sourceMap',         // whether to output a source map
    'importMultiple',    // whether we are currently importing multiple copies
    'urlArgs',           // whether to add args into url tokens
    'javascriptEnabled', // option - whether Inline JavaScript is enabled. if undefined, defaults to false
    'pluginManager',     // Used as the plugin manager for the session
    'importantScope',    // used to bubble up !important statements
    'rewriteUrls'        // option - whether to adjust URL's to be relative
*/

const File = require('@gotoeasy/file');
const findNodeModules = require('find-node-modules');

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

// opts注意设定filename或paths以便正确处理imports
module.exports = (function(importLesshat){

	// 默认支持lesshat @import ".../lesshat.less";
	importLesshat = getImportLesshat(); // 用相对目录找出lesshat.less
	if ( !importLesshat ) {
		console.warn(MODULE, 'file not found:', 'lesshat.less');
		importLesshat = '';
	}

	// file仅用于出错信息提示
	return function(src, opts={}){
		let srcLess = importLesshat + src; // 自动添加 @import ".../lesshat.less";

		opts.javascriptEnabled = true;
		opts.plugins = opts.plugins || [];
		
		return require('less').render(srcLess, opts); // 返回Promise对象
	}

})();


function getImportLesshat() {
	let ary = findNodeModules({ cwd: __dirname, relative: false });
	for ( let i=0,path,file; path=ary[i++]; ) {
		file = path.replace(/\\/g, '/') + '/lesshat/lesshat.less';
		if ( File.exists(file) ) {
			return '@import "' + file + '";\n';
		}
	}
}