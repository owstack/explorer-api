const Joi = require('joi');

const controllers = {
    addresses: require('../controller/addresses'),
    blocks: require('../controller/blocks'),
    currency: require('../controller/currency'),
    messages: require('../controller/messages'),
    transactions: require('../controller/transactions'),
    status: require('../controller/status'),
    utility: require('../controller/utils'),
};

const cors = {
    headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Content-Length', 'Cache-Control', 'cf-connecting-ip']
};

const cacheShort = {
    privacy: 'public',
    expiresIn: 30 * 1000,
};

const cacheLong = {
    privacy: 'public',
    expiresIn: 86400 * 1000,
};

const routes = [
    // blocks
    {
        method: 'GET',
        path: '/block/{hash}',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.blocks.show,
            description: 'Get a block by hash',
            tags: ['api', 'block']
        }
    },
    {
        method: 'GET',
        path: '/block-index/{height}',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.blocks.blockIndex,
            description: 'Get a block hash by height',
            tags: ['api', 'block']
        }
    },
    {
        method: 'GET',
        path: '/rawblock/{hash}',
        config: {
            jsonp: 'callback',
            cache: cacheLong,
            cors,
            handler: controllers.blocks.showRaw,
            description: 'Get a raw block by hash',
            tags: ['api', 'block']
        }
    },
    {
        method: 'GET',
        path: '/blocks',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.blocks.list,
            description: 'Get a raw block by hash or height',
            tags: ['api', 'block'],
            validate: {
                query: {
                    limit: Joi.number().integer().positive().optional().description('The number of blocks to return'),
                    blockDate: Joi.string().optional().description('The block date to search by \'YYYY-MM-DD\'. Example: \'2019-12-31\''),
                    startTimestamp: Joi.number().integer().positive().optional().descriotion('Timestamp to start from for pagination')
                }
            }
        }
    },
    // transactions
    {
        method: 'GET',
        path: '/tx/{txid}',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.transactions.show,
            description: 'Get a transaction by txid',
            tags: ['api', 'transaction']
        }
    },
    {
        method: 'GET',
        path: '/rawtx/{txid}',
        config: {
            jsonp: 'callback',
            cache: cacheLong,
            cors,
            handler: controllers.transactions.showRaw,
            description: 'Get a raw transaction by txid',
            tags: ['api', 'transaction']
        }
    },
    {
        method: 'GET',
        path: '/txs',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.transactions.list,
            description: 'Get a raw transaction by txid',
            tags: ['api', 'transaction'],
            validate: {
                query: {
                    block: Joi.string().optional().description('The block hash to search by. Must not be combined with address.'),
                    address: Joi.string().optional().description('The address to search by. Must not be combined with block.')

                }
            }
        }
    },
    {
        method: 'POST',
        path: '/tx/send',
        config: {
            jsonp: 'callback',
            cors,
            handler: controllers.transactions.send,
            description: 'Send a raw transaction',
            tags: ['api', 'transaction'],
            validate: {
                payload: {
                    rawtx: Joi.string().required().description('The signed raw transaction as a hex string')
                }
            }
        }
    },
    // addresses
    {
        method: 'GET',
        path: '/addr/{addr}',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.addresses.show,
            description: 'Get details for an address',
            tags: ['api', 'address'],
            validate: {
                query: {
                    from: Joi.number().integer().min(1).optional().description('For pagination. The number to start from'),
                    to: Joi.number().integer().min(1).optional().description('For pagination. The number to stop at'),
                    noTxList: Joi.number().integer().min(1).max(1).optional().description('If provided, tx list is excluded')
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/addr/{addr}/balance',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.addresses.balance,
            description: 'Get an address balance',
            tags: ['api', 'address'],
        }
    },
    {
        method: 'GET',
        path: '/addr/{addr}/totalReceived',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.addresses.totalReceived,
            description: 'Get total received for an address',
            tags: ['api', 'address'],
        }
    },
    {
        method: 'GET',
        path: '/addr/{addr}/totalSent',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.addresses.totalSent,
            description: 'Get total sent for an address',
            tags: ['api', 'address'],
        }
    },
    {
        method: 'GET',
        path: '/addr/{addr}/unconfirmedBalance',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.addresses.unconfirmedBalance,
            description: 'Get an address balance',
            tags: ['api', 'address'],
        }
    },
    {
        method: 'GET',
        path: '/addr/{addr}/utxo',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.addresses.utxo,
            description: 'Get an address utxo set',
            tags: ['api', 'address'],
        }
    },
    // multi-address
    {
        method: 'GET',
        path: '/addrs/{addrs}/utxo',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.addresses.multiutxo,
            description: 'Get address utxo set for multiple addresses at once',
            tags: ['api', 'addresses'],
        }
    },
    {
        method: 'POST',
        path: '/addrs/utxo',
        config: {
            jsonp: 'callback',
            cors,
            handler: controllers.addresses.multiutxo,
            description: 'Get address utxo set for multiple addresses at once',
            tags: ['api', 'addresses'],
            validate: {
                payload: {
                    addrs: Joi.string().required().description('Provide multiple addresses separated by comma. Example: \'2NF2baYuJAkCKo5onjUKEPdARQkZ6SYyKd5,2NAre8sX2povnjy4aeiHKeEh97Qhn97tB1f\'')
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/addrs/{addrs}/txs',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.addresses.multitxs,
            description: 'Get transactions for multiple addresses at once',
            tags: ['api', 'addresses'],
            validate: {
                query: {
                    from: Joi.number().integer().positive().optional().description('For pagination. The number to start from'),
                    to: Joi.number().integer().positive().optional().description('For pagination. The number to stop at'),
                    noAsm: Joi.number().integer().positive().optional().description('Provide a 1 to omit asm from results'),
                    noScriptSig: Joi.number().integer().positive().optional().description('Provide a 1 to omit the scriptSig from results'),
                    noSpent: Joi.number().integer().positive().optional().description('Provide a 1 to omit spent info from results')
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/addrs/txs',
        config: {
            jsonp: 'callback',
            cors,
            handler: controllers.addresses.multitxs,
            description: 'Get transactions for multiple addresses at once',
            tags: ['api', 'addresses'],
            validate: {
                payload: {
                    addrs: Joi.string().required().description('Provide multiple addresses separated by comma. Example: \'2NF2baYuJAkCKo5onjUKEPdARQkZ6SYyKd5,2NAre8sX2povnjy4aeiHKeEh97Qhn97tB1f\''),
                    from: Joi.number().integer().positive().optional().description('For pagination. The number to start from'),
                    to: Joi.number().integer().positive().optional().description('For pagination. The number to stop at'),
                    noAsm: Joi.number().integer().positive().optional().description('Provide a 1 to omit asm from results'),
                    noScriptSig: Joi.number().integer().positive().optional().description('Provide a 1 to omit the scriptSig from results'),
                    noSpent: Joi.number().integer().positive().optional().description('Provide a 1 to omit spent info from results'),
                }
            }
        }
    },
    // status
    {
        method: 'GET',
        path: '/sync',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.status.sync,
            description: 'Historic blockchain data sync status',
            tags: ['api', 'status']
        }
    },
    {
        method: 'GET',
        path: '/peer',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.status.peer,
            description: 'Live network p2p status',
            tags: ['api', 'status']
        }
    },
    {
        method: 'GET',
        path: '/status',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.status.show,
            description: 'Historic blockchain data sync status',
            tags: ['api', 'status'],
            validate: {
                query: {
                    q: Joi.string().optional().valid(['getInfo', 'getDifficulty', 'getBestBlockHash', 'getLastBlockHash']).description('Run one of these 4 specific queries'),
                }
            }

        }
    },
    {
        method: 'GET',
        path: '/version',
        config: {
            jsonp: 'callback',
            cache: cacheShort,
            cors,
            handler: controllers.status.version,
            description: 'Live network p2p status',
            tags: ['api', 'status']
        }
    },
    //utility
    {
        method: 'GET',
        path: '/utils/estimatefee',
        config: {
            jsonp: 'callback',
            cors,
            handler: controllers.utility.estimateFee,
            description: 'Get fee estimate',
            tags: ['api', 'utility'],
            validate: {
                query: {
                    nbBlocks: Joi.string().optional().description('A comma separated list of numbers to request fees for'),
                }
            }
        }
    },
    // messages
    {
        method: 'GET',
        path: '/messages/verify',
        config: {
            jsonp: 'callback',
            cors,
            handler: controllers.messages.verify,
            description: 'Verify a message signature',
            tags: ['api', 'message'],
            validate: {
                query: {
                    address: Joi.string().required().description('The address'),
                    signature: Joi.string().required().description('The signature'),
                    message: Joi.string().required().description('The message'),
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/messages/verify',
        config: {
            jsonp: 'callback',
            cors,
            handler: controllers.messages.verify,
            description: 'Verify a message signature',
            tags: ['api', 'message'],
            validate: {
                payload: {
                    address: Joi.string().required().description('The address'),
                    signature: Joi.string().required().description('The signature'),
                    message: Joi.string().required().description('The message'),
                }
            }
        }
    },
    // currency
    {
        method: 'GET',
        path: '/currency',
        config: {
            jsonp: 'callback',
            cors,
            handler: controllers.currency.index,
            description: 'Get conversion rate',
            tags: ['api', 'currency']
        }
    },
];

module.exports = routes;
