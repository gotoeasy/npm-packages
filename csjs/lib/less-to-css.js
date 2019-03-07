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

const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

// opts注意设定filename或paths以便正确处理imports
module.exports = (function(){

	let node_modules = [...require('find-node-modules')({ cwd: __dirname, relative: false })];
    let paths = [];
    node_modules.forEach(p => paths.push(require('@gotoeasy/file').resolve(p, '..')));

	// file仅用于出错信息提示
	return function(src, opts={}){

	let node_modules = [...require('find-node-modules')({ cwd: process.cwd(), relative: false }), ...require('find-node-modules')({ cwd: __dirname, relative: false })];

		opts.javascriptEnabled = true;
		opts.plugins = opts.plugins || [];
		opts.paths = [...new Set([...new Set(opts.paths || []), ...paths])];    // 添加node_modules目录，去重复

        let err, css;
		require('less').render(src, opts, function(error, output) {
            error && (err = error);
            css = output.css;
        });

        if ( err ) {
            throw err;
        }

        return css;
	}

})();

