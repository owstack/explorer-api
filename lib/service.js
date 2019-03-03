const http = require('http');
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('@owstack/hapi-swagger');

const HapiSocketIO = require('./hapi-socket.io');
const HapiBlockchain = require('@owstack/hapi-blockchain');

const conf = require('../config');
const config = conf.get();
const swaggerOptions = require('../config/openapi');
const routes = require('./routes');

const txController = require('../controller/transactions');

class Service {
    constructor(options = {}) {
        this.server = Hapi.server({
            address: '0.0.0.0',
            autoListen: true,
            listener: http.createServer(),
            port: options.port || config.port,
            host: options.externalHostname || config.externalHostname,
            router: {
                stripTrailingSlash: true
            }
        });
        this.plugins = [
            Inert,
            Vision,
            {
                plugin: HapiSwagger,
                options: swaggerOptions
            },
            HapiSocketIO,
            {
                plugin: HapiBlockchain,
                options: {
                    currency: config.currency.toUpperCase(),
                    nodes: config.connect.nodes
                }
            }
        ];
        this.server.app.config = config;
        this.state = 'stopped';
    }

    async start() {
        this.state = 'starting';
        console.log('connecting to nodes', config.connect.nodes.map((nodeObj) => {
            return `${nodeObj.rpcprotocol}://${nodeObj.rpchost}:${nodeObj.rpcport}`;
        }));
        await this.server.register(this.plugins);

        this.server.app.blockchain.on('block', (hashBuffer) => {
            this.server.app.io.sockets.in('inv').emit('block', hashBuffer.toString('hex'));
        });

        this.server.app.blockchain.on('tx', (txBuffer) => {
            const tx = new this.server.app.blockchain.coinLib.Transaction().fromBuffer(txBuffer);
            this.server.app.io.sockets.in('inv').emit('tx', txController._transformInvTransaction(tx));
        });

        this.server.app.blockchain.on('address', (data) => {
            this.server.app.io.sockets.in(data.address).emit('address', data);
        });

        this.server.route(routes);
        await this.server.start();
        this.state = 'started';
    }

    async stop() {
        this.state = 'stopping';
        await this.server.stop();
        this.state = 'stopped';
    }
}

module.exports = Service;
