
const Service = require('./lib/service');
const conf = require('./config');
const config = conf.get();
const service = new Service({
    port: config.port,
    externalHostname: config.externalHostname
});

async function start() {
    try {
        await service.start();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', service.server.info.uri);
    console.log('Documentation at:', `${service.server.info.uri}/documentation`);
}

async function stop() {
    try {
        await service.stop();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server stopped.');
}

start();
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
