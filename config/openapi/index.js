const pkg = require('../../package.json');
const conf = require('../');
const config = conf.get();

let swaggerHost = config.externalHostname;
if (config.externalPort !== 80 && config.externalPort !== 443) {
    swaggerHost = `${swaggerHost}:${config.externalPort}`;
}
const swaggerOptions = {
    info: {
        title: `${pkg.name} API Documentation`,
        description: 'A socket.io API is also provided for real-time updates. See README at https://github.com/owstack/explorer-api for details',
        version: pkg.version
    },
    host: swaggerHost,
    tags: [
        {
            name: 'block',
            description: 'Block Data'
        },
        {
            name: 'transaction',
            description: 'Transaction Data'
        },
        {
            name: 'address',
            description: 'Address Data'
        },
        {
            name: 'addresses',
            description: 'Multi-Address Data'
        },
        {
            name: 'status',
            description: 'API Status Information'
        },
        {
            name: 'utility',
            description: 'Utility Routes'
        },
        {
            name: 'message',
            description: 'Message routes'
        },
        {
            name: 'currency',
            description: 'Currency routes'
        }
    ],
    grouping: 'tags',
    proxyPath: config.proxyPath
};

module.exports = swaggerOptions;
