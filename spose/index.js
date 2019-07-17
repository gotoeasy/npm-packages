
module.exports = function (name, options={}){

    let opts = Object.assign({}, {csw: process.cwd()}, options);

    if ( name === 'admin' ) {
        return require('./generate/admin')(opts);
    }else if ( name === 'config' ) {
        return require('./generate/config')(opts);
    }else if ( name === 'eureka' ) {
        return require('./generate/eureka')(opts);
    }else if ( name === 'gateway' ) {
        return require('./generate/gateway')(opts);
    }else if ( name === 'helloworld' ) {
        return require('./generate/helloworld')(opts);
    }else if ( name === 'kafka-consumer' ) {
        return require('./generate/kafka-consumer')(opts);
    }else if ( name === 'kafka-producer' ) {
        return require('./generate/kafka-producer')(opts);
    }else if ( name === 'redis' ) {
        return require('./generate/redis')(opts);
    }else if ( name === 'turbine' ) {
        return require('./generate/turbine')(opts);
    }else if ( name === 'zipkin' ) {
        return require('./generate/turbine')(zipkin);
    }

}
