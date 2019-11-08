const bus = require('@gotoeasy/bus');

bus.on('环境', function(result){

    return function(opts, nocache=false){
        nocache && (result = null);
        if ( result ) return result;

        result = {};
        result.clean = !!opts.clean;
        result.release = !!opts.release;
        result.debug = !!opts.debug;
        result.nocache = !!opts.nocache;
        result.build = !!opts.build;
        result.watch = !!opts.watch;

        return result;
    };

}());
