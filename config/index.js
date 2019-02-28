const nconf = require('nconf');

const externalHostname = process.env.EXTERNAL_HOSTNAME || 'localhost';
const port = Number(process.env.SERVICE_PORT) || 3001;
const numHosts = Number(process.env.RPCHOSTS) || 1;
const currency = (process.env.CURRENCY && process.env.CURRENCY.toUpperCase()) || 'BTC';
const baseHostname = process.env.RPCHOST_BASE || 'bitcoin';
const externalPort = Number(process.env.EXTERNAL_PORT) || port;

const defaultConf = {
    port,
    externalHostname,
    externalPort,
    currency,
    connect: {
        nodes: []
    },
    proxyPath: process.env.PROXY_PATH
};

if (process.env.NCONF_PATH) {
    nconf.defaults(defaultConf);
    nconf.use('file', {file: process.env.NCONF_PATH});
} else {
    for (let i = 0; i < numHosts; i++) {
        defaultConf.connect.nodes.push({
            zmqpubrawtx: `tcp://${baseHostname}-${i}:28332`,
            zmqpubhashblock: `tcp://${baseHostname}-${i}:28332`,
            protocol: 'http',
            host: `${baseHostname}-${i}`,
            port: 8332,
            user: process.env.RPCUSERNAME || '',
            password: process.env.RPCPASSWORD || ''
        });
    }
    if (!process.env.RPCUSERNAME || !process.env.RPCPASSWORD) {
        console.error('Config error: Using default generated config. See README.md for configuration details.');
    }
    nconf.defaults(defaultConf);
}

module.exports = nconf;
