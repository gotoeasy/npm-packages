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

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

// opts注意设定filename或paths以便正确处理imports
module.exports = (function(importLesshat){

	// 默认支持lesshat @import ".../lesshat.less";
	let ary = __dirname.replace(/\\/g, '/').split('/');
	ary.pop(); // lib
	ary.pop(); // csjs
	ary.pop(); // @gotoeasy
	ary.push('lesshat/lesshat.less');
	importLesshat = ary.join('/'); // 用相对目录找出lesshat.less
	if ( !File.exists(importLesshat) ) {
		importLesshat = '';
	}else{
		importLesshat = '@import "' + importLesshat + '";\n';
	}

	// file仅用于出错信息提示
	return function(src, file, opts={}){
		let srcLess = importLesshat + src; // 自动添加 @import ".../lesshat.less";

		opts.javascriptEnabled = true;
		opts.plugins = opts.plugins || [];
		
		// autoprefixer
		var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
		autoprefixPlugin = new LessPluginAutoPrefix({browsers: ["last 2 versions"]});
		opts.plugins.push(autoprefixPlugin);

		try{
			return require('less').render(srcLess, opts);
		}catch(e){
			console.error(MODULE, 'less compile failed, file:', file)
			console.error(MODULE, e)
			throw e;
		}
	}
})();
