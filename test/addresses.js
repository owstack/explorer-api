const sinon = require('sinon');
const should = require('should');
const {Blockchain} = require('@owstack/hapi-blockchain');
const _ = require('lodash');
const request = require('supertest');

const addresses = require('../controller/addresses');

const tx = {
    height: 534181,
    blockTimestamp: 1441116143,
    blockHash: '0000000000000041ddc94ecf4f86a456a83b2e320c36c6f0c13ff92c7e75f013',
    hex: '0100000002f379708395d0a0357514205a3758a0317926428356e54a09089852fc6f7297ea010000008a473044022054233934268b30be779fad874ef42e8db928ba27a1b612d5f111b3ee95eb271c022024272bbaf2dcc4050bd3b9dfa3c93884f6ba6ad7d257598b8245abb65b5ab1e40141040682fdb281a8533e21e13dfd1fcfa424912a85b6cdc4136b5842c85de05ac1f0e4a013f20702adeb53329de13b2ef388e5ed6244676f4f1ee4ee685ab607964dffffffffb758ffd4c31693d9620f326385404530a079d5e60a90b94e46d3c2dbc29c0a98020000008a473044022044938ac3f8fcb8da29011df6397ed28cc7e894cdc35d596d4f3623bd8c7e465f022014829c6e0bd7ee97a1bcfef6b85c5fd232653f289394fc6ce6ebb41c73403f1b014104d9ccf88efc6e5be3151fae5e848efd94c91d75e7bf621f9f724a8caff51415338525d3239fae6b93826edf759dd562f77693e55dfa852ffd96a92d683db590f2ffffffff03605b0300000000001976a914b9bbd76588d9e4e09f0369a9aa0b2749a11c4e8d88ac40992d03000000001976a914d2ec20bb8e5f25a52f730384b803d95683250e0b88ac256c0400000000001976a914583df9fa56ad961051e00ca93e68dfaf1eab9ec588ac00000000',
    hash: '63b68becb0e514b32317f4b29a5cf0627d4087e54ac17f686fcb1d9a27680f73',
    version: 1,
    inputSatoshis: 53839829,
    outputSatoshis: 53829829,
    feeSatoshis: 10000,
    inputs: [
        {
            address: 'moFfnRwt77pApKnnU6m5uocFaa43aAYpt5',
            prevTxId: 'ea97726ffc529808094ae5568342267931a058375a20147535a0d095837079f3',
            outputIndex: 1,
            sequence: 4294967295,
            script: '473044022054233934268b30be779fad874ef42e8db928ba27a1b612d5f111b3ee95eb271c022024272bbaf2dcc4050bd3b9dfa3c93884f6ba6ad7d257598b8245abb65b5ab1e40141040682fdb281a8533e21e13dfd1fcfa424912a85b6cdc4136b5842c85de05ac1f0e4a013f20702adeb53329de13b2ef388e5ed6244676f4f1ee4ee685ab607964d',
            scriptAsm: '3044022054233934268b30be779fad874ef42e8db928ba27a1b612d5f111b3ee95eb271c022024272bbaf2dcc4050bd3b9dfa3c93884f6ba6ad7d257598b8245abb65b5ab1e401 040682fdb281a8533e21e13dfd1fcfa424912a85b6cdc4136b5842c85de05ac1f0e4a013f20702adeb53329de13b2ef388e5ed6244676f4f1ee4ee685ab607964d',
            satoshis: 53540000,
        },
        {
            address: 'n1XJBAyU4hNR4xRtY3UxnmAteoJX83p5qv',
            prevTxId: '980a9cc2dbc2d3464eb9900ae6d579a03045408563320f62d99316c3d4ff58b7',
            outputIndex: 2,
            sequence: 4294967295,
            script: '473044022044938ac3f8fcb8da29011df6397ed28cc7e894cdc35d596d4f3623bd8c7e465f022014829c6e0bd7ee97a1bcfef6b85c5fd232653f289394fc6ce6ebb41c73403f1b014104d9ccf88efc6e5be3151fae5e848efd94c91d75e7bf621f9f724a8caff51415338525d3239fae6b93826edf759dd562f77693e55dfa852ffd96a92d683db590f2',
            scriptAsm: '3044022044938ac3f8fcb8da29011df6397ed28cc7e894cdc35d596d4f3623bd8c7e465f022014829c6e0bd7ee97a1bcfef6b85c5fd232653f289394fc6ce6ebb41c73403f1b01 04d9ccf88efc6e5be3151fae5e848efd94c91d75e7bf621f9f724a8caff51415338525d3239fae6b93826edf759dd562f77693e55dfa852ffd96a92d683db590f2',
            satoshis: 299829,
        }
    ],
    outputs: [
        {
            satoshis: 220000,
            script: '76a914b9bbd76588d9e4e09f0369a9aa0b2749a11c4e8d88ac',
            scriptAsm: 'OP_DUP OP_HASH160 b9bbd76588d9e4e09f0369a9aa0b2749a11c4e8d OP_EQUALVERIFY OP_CHECKSIG',
            address: 'mxT2KzTUQvsaYYothDtjcdvyAdaHA9ofMp'
        },
        {
            satoshis: 53320000,
            address: 'mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK',
            script: '76a914d2ec20bb8e5f25a52f730384b803d95683250e0b88ac',
            scriptAsm: 'OP_DUP OP_HASH160 d2ec20bb8e5f25a52f730384b803d95683250e0b OP_EQUALVERIFY OP_CHECKSIG'
        },
        {
            address: 'moZY18rGNmh4YCPeugtGW46AkkWMQttBUD',
            satoshis: 289829,
            script: '76a914583df9fa56ad961051e00ca93e68dfaf1eab9ec588ac',
            scriptAsm: 'OP_DUP OP_HASH160 583df9fa56ad961051e00ca93e68dfaf1eab9ec5 OP_EQUALVERIFY OP_CHECKSIG'
        }
    ],
    locktime: 0
};

const txinfos2 = {
    totalCount: 1,
    items: [
        {
            tx: tx
        }
    ]
};

const utxos = [
    {
        address: 'mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK',
        txid: '63b68becb0e514b32317f4b29a5cf0627d4087e54ac17f686fcb1d9a27680f73',
        outputIndex: 1,
        timestamp: 1441116143,
        satoshis: 53320000,
        script: '76a914d2ec20bb8e5f25a52f730384b803d95683250e0b88ac',
        height: 534181,
        confirmations: 50
    },
    {
        address: 'moZY18rGNmh4YCPeugtGW46AkkWMQttBUD',
        txid: '63b68becb0e514b32317f4b29a5cf0627d4087e54ac17f686fcb1d9a27680f73',
        outputIndex: 2,
        timestamp: 1441116143,
        satoshis: 289829,
        script: '76a914583df9fa56ad961051e00ca93e68dfaf1eab9ec588ac',
        height: 534181,
        confirmations: 50
    }
];

describe('Addresses', function () {
    const summary = {
        balance: 0,
        totalReceived: 2782729129,
        totalSpent: 2782729129,
        unconfirmedBalance: 0,
        appearances: 2,
        unconfirmedAppearances: 0,
        txids: [
            'bb0ec3b96209fac9529570ea6f83a86af2cceedde4aaf2bfcc4796680d23f1c7',
            '01f700df84c466f2a389440e5eeacdc47d04f380c39e5d19dce2ce91a11ecba3'
        ]
    };

    describe('/addr/:addr', function () {

        beforeEach(function () {
            sinon.stub(Blockchain.prototype, 'getAddressSummary').resolves(summary);
        });

        afterEach(function () {
            Blockchain.prototype.getAddressSummary.restore();
        });

        it('should have correct data', function () {
            const insight = {
                addrStr: 'mkPvAKZ2rar6qeG3KjBtJHHMSP1wFZH7Er',
                balance: 0,
                balanceSat: 0,
                totalReceived: 27.82729129,
                totalReceivedSat: 2782729129,
                totalSent: 27.82729129,
                totalSentSat: 2782729129,
                unconfirmedBalance: 0,
                unconfirmedBalanceSat: 0,
                unconfirmedTxApperances: 0,
                txApperances: 2,
                transactions: [
                    'bb0ec3b96209fac9529570ea6f83a86af2cceedde4aaf2bfcc4796680d23f1c7',
                    '01f700df84c466f2a389440e5eeacdc47d04f380c39e5d19dce2ce91a11ecba3'
                ]
            };


            return request(this.service.server.listener)
                .get('/addr/mkPvAKZ2rar6qeG3KjBtJHHMSP1wFZH7Er')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    should(res.body).eql(insight);
                });
        });

        it('handle error', function () {
            Blockchain.prototype.getAddressSummary.restore();
            sinon.stub(Blockchain.prototype, 'getAddressSummary').rejects(new Error('test'));
            sinon.stub(console, 'error');

            return request(this.service.server.listener)
                .get('/addr/mkPvAKZ2rar6qeG3KjBtJHHMSP1wFZH7Er?noTxList=1')
                .set('Accept', 'application/json')
                .expect(503)
                .then((res) => {
                    should(res.error.text).eql('test');
                    console.error.restore();
                });
        });

        it('/balance', function () {
            const insight = 0;

            return request(this.service.server.listener)
                .get('/addr/mkPvAKZ2rar6qeG3KjBtJHHMSP1wFZH7Er/balance')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    should(res.body).eql(insight);
                });
        });

        it('/totalReceived', function () {
            const insight = 2782729129;

            return request(this.service.server.listener)
                .get('/addr/mkPvAKZ2rar6qeG3KjBtJHHMSP1wFZH7Er/totalReceived')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    should(res.body).eql(insight);
                });
        });

        it('/totalSent', function () {
            const insight = 2782729129;

            return request(this.service.server.listener)
                .get('/addr/mkPvAKZ2rar6qeG3KjBtJHHMSP1wFZH7Er/totalSent')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    should(res.body).eql(insight);
                });
        });

        it('/unconfirmedBalance', function () {
            const insight = 0;

            return request(this.service.server.listener)
                .get('/addr/mkPvAKZ2rar6qeG3KjBtJHHMSP1wFZH7Er/unconfirmedBalance')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    should(res.body).eql(insight);
                });
        });
    });

    describe('/addr/:addr/utxo', function () {
        before(function () {
            sinon.stub(Blockchain.prototype, 'getAddressUnspentOutputs').resolves(utxos.slice(0, 1));
            this.service.server.app.blockchain.height = 534230;
        });

        after(function () {
            Blockchain.prototype.getAddressUnspentOutputs.restore();
        });

        it('should have correct data', function () {
            const insight = [
                {
                    address: 'mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK',
                    txid: '63b68becb0e514b32317f4b29a5cf0627d4087e54ac17f686fcb1d9a27680f73',
                    vout: 1,
                    ts: 1441116143,
                    scriptPubKey: '76a914d2ec20bb8e5f25a52f730384b803d95683250e0b88ac',
                    amount: 0.5332,
                    confirmations: 50,
                    height: 534181,
                    satoshis: 53320000,
                    confirmationsFromCache: true
                }
            ];

            const todos = [
                {
                    confirmationsFromCache: true
                }
            ];

            return request(this.service.server.listener)
                .get('/addr/mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK/utxo')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    const merged = _.merge(res.body, todos);
                    should(merged).eql(insight);
                });
        });
    });

    describe('/addrs/:addrs/utxo', function () {
        before(function () {
            sinon.stub(Blockchain.prototype, 'getAddressUnspentOutputs').resolves(utxos);
            this.service.server.app.blockchain.height = 534230;
        });

        after(function () {
            Blockchain.prototype.getAddressUnspentOutputs.restore();
        });

        it('should have the correct data via GET', function () {
            const insight = [
                {
                    address: 'mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK',
                    txid: '63b68becb0e514b32317f4b29a5cf0627d4087e54ac17f686fcb1d9a27680f73',
                    vout: 1,
                    ts: 1441116143,
                    scriptPubKey: '76a914d2ec20bb8e5f25a52f730384b803d95683250e0b88ac',
                    amount: 0.5332,
                    height: 534181,
                    satoshis: 53320000,
                    confirmations: 50,
                    confirmationsFromCache: true
                },
                {
                    address: 'moZY18rGNmh4YCPeugtGW46AkkWMQttBUD',
                    txid: '63b68becb0e514b32317f4b29a5cf0627d4087e54ac17f686fcb1d9a27680f73',
                    vout: 2,
                    ts: 1441116143,
                    scriptPubKey: '76a914583df9fa56ad961051e00ca93e68dfaf1eab9ec588ac',
                    amount: 0.00289829,
                    height: 534181,
                    satoshis: 289829,
                    confirmations: 50,
                    confirmationsFromCache: true
                }
            ];

            const todos = [
                {
                    confirmationsFromCache: true
                },
                {
                    confirmationsFromCache: true
                }
            ];

            return request(this.service.server.listener)
                .get('/addrs/mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK,moZY18rGNmh4YCPeugtGW46AkkWMQttBUD/utxo')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    const merged = _.merge(res.body, todos);
                    should(merged).eql(insight);
                });
        });

        it('should have the correct data via POST', function () {
            const insight = [
                {
                    address: 'mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK',
                    txid: '63b68becb0e514b32317f4b29a5cf0627d4087e54ac17f686fcb1d9a27680f73',
                    vout: 1,
                    ts: 1441116143,
                    scriptPubKey: '76a914d2ec20bb8e5f25a52f730384b803d95683250e0b88ac',
                    amount: 0.5332,
                    height: 534181,
                    satoshis: 53320000,
                    confirmations: 50,
                    confirmationsFromCache: true
                },
                {
                    address: 'moZY18rGNmh4YCPeugtGW46AkkWMQttBUD',
                    txid: '63b68becb0e514b32317f4b29a5cf0627d4087e54ac17f686fcb1d9a27680f73',
                    vout: 2,
                    ts: 1441116143,
                    scriptPubKey: '76a914583df9fa56ad961051e00ca93e68dfaf1eab9ec588ac',
                    amount: 0.00289829,
                    height: 534181,
                    satoshis: 289829,
                    confirmations: 50,
                    confirmationsFromCache: true
                }
            ];

            const todos = [
                {
                    confirmationsFromCache: true
                },
                {
                    confirmationsFromCache: true
                }
            ];

            return request(this.service.server.listener)
                .post('/addrs/utxo')
                .set('Accept', 'application/json')
                .send({addrs: 'mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK,moZY18rGNmh4YCPeugtGW46AkkWMQttBUD'})
                .expect(200)
                .then((res) => {
                    const merged = _.merge(res.body, todos);
                    should(merged).eql(insight);
                });
        });
    });

    describe('/addrs/:addrs/txs', function () {
        before(function () {
            sinon.stub(Blockchain.prototype, 'getAddressHistory').resolves(txinfos2);
            this.service.server.app.blockchain.height = 534232;
        });

        after(function () {
            Blockchain.prototype.getAddressHistory.restore();
        });

        it('should have correct data', function () {
            const insight = {
                totalItems: 1,
                from: 0,
                to: 1,
                items: [
                    {
                        txid: '63b68becb0e514b32317f4b29a5cf0627d4087e54ac17f686fcb1d9a27680f73',
                        version: 1,
                        locktime: 0,
                        vin: [
                            {
                                txid: 'ea97726ffc529808094ae5568342267931a058375a20147535a0d095837079f3',
                                vout: 1,
                                scriptSig: {
                                    asm: '3044022054233934268b30be779fad874ef42e8db928ba27a1b612d5f111b3ee95eb271c022024272bbaf2dcc4050bd3b9dfa3c93884f6ba6ad7d257598b8245abb65b5ab1e401 040682fdb281a8533e21e13dfd1fcfa424912a85b6cdc4136b5842c85de05ac1f0e4a013f20702adeb53329de13b2ef388e5ed6244676f4f1ee4ee685ab607964d',
                                    hex: '473044022054233934268b30be779fad874ef42e8db928ba27a1b612d5f111b3ee95eb271c022024272bbaf2dcc4050bd3b9dfa3c93884f6ba6ad7d257598b8245abb65b5ab1e40141040682fdb281a8533e21e13dfd1fcfa424912a85b6cdc4136b5842c85de05ac1f0e4a013f20702adeb53329de13b2ef388e5ed6244676f4f1ee4ee685ab607964d'
                                },
                                sequence: 4294967295,
                                n: 0,
                                addr: 'moFfnRwt77pApKnnU6m5uocFaa43aAYpt5',
                                valueSat: 53540000,
                                value: 0.5354,
                                doubleSpentTxID: null
                            },
                            {
                                txid: '980a9cc2dbc2d3464eb9900ae6d579a03045408563320f62d99316c3d4ff58b7',
                                vout: 2,
                                scriptSig: {
                                    asm: '3044022044938ac3f8fcb8da29011df6397ed28cc7e894cdc35d596d4f3623bd8c7e465f022014829c6e0bd7ee97a1bcfef6b85c5fd232653f289394fc6ce6ebb41c73403f1b01 04d9ccf88efc6e5be3151fae5e848efd94c91d75e7bf621f9f724a8caff51415338525d3239fae6b93826edf759dd562f77693e55dfa852ffd96a92d683db590f2',
                                    hex: '473044022044938ac3f8fcb8da29011df6397ed28cc7e894cdc35d596d4f3623bd8c7e465f022014829c6e0bd7ee97a1bcfef6b85c5fd232653f289394fc6ce6ebb41c73403f1b014104d9ccf88efc6e5be3151fae5e848efd94c91d75e7bf621f9f724a8caff51415338525d3239fae6b93826edf759dd562f77693e55dfa852ffd96a92d683db590f2'
                                },
                                sequence: 4294967295,
                                n: 1,
                                addr: 'n1XJBAyU4hNR4xRtY3UxnmAteoJX83p5qv',
                                valueSat: 299829,
                                value: 0.00299829,
                                doubleSpentTxID: null
                            }
                        ],
                        vout: [
                            {
                                value: '0.00220000',
                                n: 0,
                                scriptPubKey: {
                                    asm: 'OP_DUP OP_HASH160 b9bbd76588d9e4e09f0369a9aa0b2749a11c4e8d OP_EQUALVERIFY OP_CHECKSIG',
                                    hex: '76a914b9bbd76588d9e4e09f0369a9aa0b2749a11c4e8d88ac',
                                    reqSigs: 1,
                                    type: 'pubkeyhash',
                                    addresses: [
                                        'mxT2KzTUQvsaYYothDtjcdvyAdaHA9ofMp'
                                    ]
                                },
                                spentHeight: null,
                                spentIndex: null,
                                spentTxId: null
                            },
                            {
                                value: '0.53320000',
                                n: 1,
                                scriptPubKey: {
                                    asm: 'OP_DUP OP_HASH160 d2ec20bb8e5f25a52f730384b803d95683250e0b OP_EQUALVERIFY OP_CHECKSIG',
                                    hex: '76a914d2ec20bb8e5f25a52f730384b803d95683250e0b88ac',
                                    reqSigs: 1,
                                    type: 'pubkeyhash',
                                    addresses: [
                                        'mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK'
                                    ],
                                },
                                spentHeight: null,
                                spentIndex: null,
                                spentTxId: null
                            },
                            {
                                value: '0.00289829',
                                n: 2,
                                scriptPubKey: {
                                    asm: 'OP_DUP OP_HASH160 583df9fa56ad961051e00ca93e68dfaf1eab9ec5 OP_EQUALVERIFY OP_CHECKSIG',
                                    hex: '76a914583df9fa56ad961051e00ca93e68dfaf1eab9ec588ac',
                                    reqSigs: 1,
                                    type: 'pubkeyhash',
                                    addresses: [
                                        'moZY18rGNmh4YCPeugtGW46AkkWMQttBUD'
                                    ]
                                },
                                spentHeight: null,
                                spentIndex: null,
                                spentTxId: null
                            }
                        ],
                        blockhash: '0000000000000041ddc94ecf4f86a456a83b2e320c36c6f0c13ff92c7e75f013',
                        blockheight: 534181,
                        confirmations: 52,
                        time: 1441116143,
                        blocktime: 1441116143,
                        valueOut: 0.53829829,
                        size: 470,
                        valueIn: 0.53839829,
                        fees: 0.0001,
                        firstSeenTs: 1441108193
                    }
                ]
            };

            const todos = {
                items: [
                    {
                        vout: [
                            {
                                scriptPubKey: {
                                    reqSigs: 1,
                                }
                            },
                            {
                                scriptPubKey: {
                                    reqSigs: 1,
                                }
                            },
                            {
                                scriptPubKey: {
                                    reqSigs: 1,
                                }
                            }
                        ],
                        firstSeenTs: 1441108193,
                        size: 470
                    }
                ]
            };

            return request(this.service.server.listener)
                .get('/addrs/mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK,moZY18rGNmh4YCPeugtGW46AkkWMQttBUD/txs')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    const merged = _.merge(res.body, todos);
                    should(merged).eql(insight);
                });
        });

        it('should have trimmed data', function () {
            const insight = {
                totalItems: 1,
                from: 0,
                to: 1,
                items: [
                    {
                        txid: '63b68becb0e514b32317f4b29a5cf0627d4087e54ac17f686fcb1d9a27680f73',
                        version: 1,
                        locktime: 0,
                        vin: [
                            {
                                txid: 'ea97726ffc529808094ae5568342267931a058375a20147535a0d095837079f3',
                                vout: 1,
                                sequence: 4294967295,
                                n: 0,
                                addr: 'moFfnRwt77pApKnnU6m5uocFaa43aAYpt5',
                                valueSat: 53540000,
                                value: 0.5354,
                                doubleSpentTxID: null
                            },
                            {
                                txid: '980a9cc2dbc2d3464eb9900ae6d579a03045408563320f62d99316c3d4ff58b7',
                                vout: 2,
                                sequence: 4294967295,
                                n: 1,
                                addr: 'n1XJBAyU4hNR4xRtY3UxnmAteoJX83p5qv',
                                valueSat: 299829,
                                value: 0.00299829,
                                doubleSpentTxID: null
                            }
                        ],
                        vout: [
                            {
                                value: '0.00220000',
                                n: 0,
                                scriptPubKey: {
                                    hex: '76a914b9bbd76588d9e4e09f0369a9aa0b2749a11c4e8d88ac',
                                    reqSigs: 1,
                                    type: 'pubkeyhash',
                                    addresses: [
                                        'mxT2KzTUQvsaYYothDtjcdvyAdaHA9ofMp'
                                    ]
                                }
                            },
                            {
                                value: '0.53320000',
                                n: 1,
                                scriptPubKey: {
                                    hex: '76a914d2ec20bb8e5f25a52f730384b803d95683250e0b88ac',
                                    reqSigs: 1,
                                    type: 'pubkeyhash',
                                    addresses: [
                                        'mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK'
                                    ],
                                }
                            },
                            {
                                value: '0.00289829',
                                n: 2,
                                scriptPubKey: {
                                    hex: '76a914583df9fa56ad961051e00ca93e68dfaf1eab9ec588ac',
                                    reqSigs: 1,
                                    type: 'pubkeyhash',
                                    addresses: [
                                        'moZY18rGNmh4YCPeugtGW46AkkWMQttBUD'
                                    ]
                                }
                            }
                        ],
                        blockhash: '0000000000000041ddc94ecf4f86a456a83b2e320c36c6f0c13ff92c7e75f013',
                        blockheight: 534181,
                        confirmations: 52,
                        time: 1441116143,
                        blocktime: 1441116143,
                        valueOut: 0.53829829,
                        size: 470,
                        valueIn: 0.53839829,
                        fees: 0.0001,
                        firstSeenTs: 1441108193
                    }
                ]
            };

            const todos = {
                items: [
                    {
                        vout: [
                            {
                                scriptPubKey: {
                                    reqSigs: 1,
                                }
                            },
                            {
                                scriptPubKey: {
                                    reqSigs: 1,
                                }
                            },
                            {
                                scriptPubKey: {
                                    reqSigs: 1,
                                }
                            }
                        ],
                        firstSeenTs: 1441108193,
                        size: 470
                    }
                ]
            };

            return request(this.service.server.listener)
                .get('/addrs/mzkD4nmQ8ixqxySdBgsXTpgvAMK5iRZpNK,moZY18rGNmh4YCPeugtGW46AkkWMQttBUD/txs?noSpent=1&noScriptSig=1&noAsm=1')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    const merged = _.merge(res.body, todos);
                    should(merged).eql(insight);
                });
        });
    });

    describe('#_getTransformOptions', function () {
        it('will return false with value of string "0"', function () {
            const req = {
                query: {
                    noAsm: '0',
                    noScriptSig: '0',
                    noSpent: '0'
                }
            };
            const options = addresses._getTransformOptions(req);
            options.should.eql({
                noAsm: false,
                noScriptSig: false,
                noSpent: false
            });
        });

        it('will return true with value of string "1"', function () {
            const req = {
                query: {
                    noAsm: '1',
                    noScriptSig: '1',
                    noSpent: '1'
                }
            };
            const options = addresses._getTransformOptions(req);
            options.should.eql({
                noAsm: true,
                noScriptSig: true,
                noSpent: true
            });
        });

        it('will return true with value of number "1"', function () {
            const req = {
                query: {
                    noAsm: 1,
                    noScriptSig: 1,
                    noSpent: 1
                }
            };
            const options = addresses._getTransformOptions(req);
            options.should.eql({
                noAsm: true,
                noScriptSig: true,
                noSpent: true
            });
        });
    });
});
