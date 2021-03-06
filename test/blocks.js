const should = require('should');
const sinon = require('sinon');
const {Blockchain} = require('@owstack/hapi-blockchain');
const request = require('supertest');

const controller = require('../controller/blocks');
const btcLib = require('@owstack/btc-lib');

const blocks = require('./data/blocks.json');

const blockIndexes = {
    '0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7': {
        hash: '0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7',
        chainWork: '0000000000000000000000000000000000000000000000054626b1839ade284a',
        prevHash: '00000000000001a55f3214e9172eb34b20e0bc5bd6b8007f3f149fca2c8991a4',
        nextHash: '000000000001e866a8057cde0c650796cb8a59e0e6038dc31c69d7ca6649627d',
        confirmations: 119,
        height: 533974
    },
    '000000000008fbb2e358e382a6f6948b2da24563bba183af447e6e2542e8efc7': {
        hash: '000000000008fbb2e358e382a6f6948b2da24563bba183af447e6e2542e8efc7',
        chainWork: '00000000000000000000000000000000000000000000000544ea52e1575ca753',
        prevHash: '00000000000006bd8fe9e53780323c0e85719eca771022e1eb6d10c62195c441',
        confirmations: 119,
        height: 533951
    },
    '00000000000006bd8fe9e53780323c0e85719eca771022e1eb6d10c62195c441': {
        hash: '00000000000006bd8fe9e53780323c0e85719eca771022e1eb6d10c62195c441',
        chainWork: '00000000000000000000000000000000000000000000000544ea52e0575ba752',
        prevHash: '000000000001b9c41e6c4a7b81a068b50cf3f522ee4ac1e942e75ec16e090547',
        height: 533950
    },
    '000000000000000004a118407a4e3556ae2d5e882017e7ce526659d8073f13a4': {
        hash: '000000000000000004a118407a4e3556ae2d5e882017e7ce526659d8073f13a4',
        prevHash: '00000000000000000a9d74a7b527f7b995fc21ceae5aa21087b443469351a362',
        height: 375493
    },
    533974: {
        hash: '0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7',
        chainWork: '0000000000000000000000000000000000000000000000054626b1839ade284a',
        prevHash: '00000000000001a55f3214e9172eb34b20e0bc5bd6b8007f3f149fca2c8991a4',
        height: 533974
    }
};

describe('Blocks', function () {
    describe('/block/:blockHash route', function () {
        const insight = {
            hash: '0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7',
            confirmations: 119,
            size: 1011,
            height: 533974,
            version: 536870919,
            merkleroot: 'b06437355844b8178173f3e18ca141472e4b0861daa81ef0f701cf9e51f0283e',
            tx: [
                '25a988e54b02e0e5df146a0f8fa7b9db56210533a9f04bdfda5f4ceb6f77aadd',
                'b85334bf2df35c6dd5b294efe92ffc793a78edff75a2ca666fc296ffb04bbba0',
                '2e01c7a4a0e335112236b711c4aaddd02e8dc59ba2cda416e8f80ff06dddd7e1'
            ],
            time: 1440987503,
            nonce: 1868753784,
            bits: '1a0cf267',
            difficulty: 1295829.93087696,
            chainwork: '0000000000000000000000000000000000000000000000054626b1839ade284a',
            previousblockhash: '00000000000001a55f3214e9172eb34b20e0bc5bd6b8007f3f149fca2c8991a4',
            nextblockhash: '000000000001e866a8057cde0c650796cb8a59e0e6038dc31c69d7ca6649627d',
            reward: 12.5,
            isMainChain: true,
            poolInfo: {}
        };


        before(function () {
            this.service.server.app.blockchain.height = 534092;
        });

        afterEach(function () {
            Blockchain.prototype.getBlock.restore();
            Blockchain.prototype.getBlockHeader.restore();
        });

        it('block data should be correct', function () {
            const btcBlock = btcLib.Block.fromBuffer(Buffer.from(blocks['0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7'], 'hex'));
            sinon.stub(Blockchain.prototype, 'getBlock').resolves(btcBlock);
            sinon.stub(Blockchain.prototype, 'getBlockHeader').resolves(blockIndexes['0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7']);

            const hash = '0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7';
            return request(this.service.server.listener)
                .get(`/block/${hash}`)
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    should(res.body).eql(insight);
                });
        });

        it('block pool info should be correct', function () {
            const block = btcLib.Block.fromString(blocks['000000000000000004a118407a4e3556ae2d5e882017e7ce526659d8073f13a4']);
            sinon.stub(Blockchain.prototype, 'getBlock').resolves(block);
            sinon.stub(Blockchain.prototype, 'getBlockHeader').resolves(blockIndexes['000000000000000004a118407a4e3556ae2d5e882017e7ce526659d8073f13a4']);

            const hash = '000000000000000004a118407a4e3556ae2d5e882017e7ce526659d8073f13a4';
            return request(this.service.server.listener)
                .get(`/block/${hash}`)
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    res.body.poolInfo.poolName.should.equal('Discus Fish');
                    res.body.poolInfo.url.should.equal('http://f2pool.com/');
                });
        });

        it('should handle unfound block', function () {
            const err = new Error('test error');
            err.code = -8;
            sinon.stub(Blockchain.prototype, 'getBlock').rejects(err);
            sinon.stub(Blockchain.prototype, 'getBlockHeader').resolves(blockIndexes['0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7']);

            const hash = '0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7';
            return request(this.service.server.listener)
                .get(`/block/${hash}`)
                .set('Accept', 'application/json')
                .expect(404)
                .then((res) => {
                    res.error.text.should.equal('Not found');
                });
        });

        it('should handle other errors', function () {
            const err = new Error('test error');
            sinon.stub(console, 'error');
            sinon.stub(Blockchain.prototype, 'getBlock').rejects(err);
            sinon.stub(Blockchain.prototype, 'getBlockHeader').resolves(blockIndexes['0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7']);

            const hash = '0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7';
            return request(this.service.server.listener)
                .get(`/block/${hash}`)
                .set('Accept', 'application/json')
                .expect(503)
                .then((res) => {
                    res.error.text.should.equal('test error');
                    console.error.restore();
                });
        });

    });

    describe('/rawblock/:blockHash route', function () {
        const insight = {
            rawblock: '07000020a491892cca9f143f7f00b8d65bbce0204bb32e17e914325fa5010000000000003e28f0519ecf01f7f01ea8da61084b2e4741a18ce1f3738117b84458353764b06fb9e35567f20c1a78eb626f0301000000010000000000000000000000000000000000000000000000000000000000000000ffffffff2303d6250800feb0aae355fe263600000963676d696e6572343208ae5800000000000000ffffffff01c018824a000000001976a91468bedce8982d25c3b6b03f6238cbad00378b8ead88ac000000000100000002ad5a14ae9d0f3221b790c4fc590fddceea1456e5692d8c4bf1ff7175f2b0c987000000008b4830450221008e5df62719cd92d7b137d00bbd27f153f2909bcad3a300960bc1020ec6d5e961022039df51600ff4fb5da5a794d1648c6b47c1f7d277fd5877fb5e52a730a3595f8c014104eb1e0ccd9afcac42229348dd776e991c69551ae3474340fada12e787e51758397e1d3afdba360d6374261125ea3b6ea079a5f202c150dfd729e1062d9176a307ffffffff9621ac65bc22ea593ca9a61a8d63e461bf3d3f277989df5d3bd33ddfae0aa1d8000000008a4730440220761464d7bab9515d92260762a97af82a9b25d202d8f7197b1aaec81b6fed541f022059f99606de6b06e17b2cd102dceb3807ebdd9e777a5b77c9a0b3672f5eabcb31014104eb1e0ccd9afcac42229348dd776e991c69551ae3474340fada12e787e51758397e1d3afdba360d6374261125ea3b6ea079a5f202c150dfd729e1062d9176a307ffffffff02dc374401000000001976a9144b7b335f978f130269fe661423258ae9642df8a188ac72b3d000000000001976a9146efcf883b4b6f9997be9a0600f6c095fe2bd2d9288ac000000000100000002060d3cb6dfb7ffe85e2908010fea63190c9707e96fc7448128eb895b5e222771030000006b483045022100f67cffc0ae23adb236ff3edb4a9736e277605db30cc7708dfab8cf1e1483bbce022052396aa5d664ec1cb65992c423fd9a17e94dc7af328d2d559e90746dd195ca5901210346134da14907581d8190d3980caaf46d95e4eb9c1ca8e70f1fc6007fefb1909dfeffffff7b2d8a8263cffbdb722e2a5c74166e6f2258634e277c0b08f51b578b667e2fba000000006a473044022077222a91cda23af69179377c62d84a176fb12caff6c5cbf6ae9e5957ff3b1afe0220768edead76819228dcba18cca3c9a5a5d4c32919720f21df21a297ba375bbe5c012103371ea5a4dfe356b3ea4042a537d7ab7ee0faabd43e21b6cc076fda2240629eeefeffffff02209a1d00000000001976a9148e451eec7ca0a1764b4ab119274efdd2727b3c8588ac40420f00000000001976a914d0fce8f064cd1059a6a11501dd66fe42368572b088accb250800'
        };


        before(function () {
            this.service.server.app.blockchain.height = 534092;
        });

        afterEach(function () {
            Blockchain.prototype.getRawBlock.restore();
        });

        it('block data should be correct', function () {
            sinon.stub(Blockchain.prototype, 'getRawBlock').resolves(Buffer.from(blocks['0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7'], 'hex'));

            const hash = '0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7';
            return request(this.service.server.listener)
                .get(`/rawblock/${hash}`)
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    should(res.body).eql(insight);
                });
        });

        it('should handle unfound block', function () {
            const err = new Error('test error');
            err.code = -8;
            sinon.stub(Blockchain.prototype, 'getRawBlock').rejects(err);

            const hash = '0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7';
            return request(this.service.server.listener)
                .get(`/rawblock/${hash}`)
                .set('Accept', 'application/json')
                .expect(404)
                .then((res) => {
                    res.error.text.should.equal('Not found');
                });
        });

        it('should handle other errors', function () {
            const err = new Error('test error');
            sinon.stub(console, 'error');
            sinon.stub(Blockchain.prototype, 'getRawBlock').rejects(err);

            const hash = '0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7';
            return request(this.service.server.listener)
                .get(`/rawblock/${hash}`)
                .set('Accept', 'application/json')
                .expect(503)
                .then((res) => {
                    res.error.text.should.equal('test error');
                    console.error.restore();
                });
        });
    });

    describe('/blocks route', function () {

        const insight = {
            blocks: [
                {
                    height: 533951,
                    size: 206,
                    hash: '000000000008fbb2e358e382a6f6948b2da24563bba183af447e6e2542e8efc7',
                    time: 1440978683,
                    txlength: 1,
                    poolInfo: {
                        poolName: 'AntPool',
                        url: 'https://www.antpool.com/'
                    }
                },
                {
                    height: 533950,
                    size: 206,
                    hash: '00000000000006bd8fe9e53780323c0e85719eca771022e1eb6d10c62195c441',
                    time: 1440977479,
                    txlength: 1,
                    poolInfo: {
                        poolName: 'AntPool',
                        url: 'https://www.antpool.com/'
                    }
                }
            ],
            length: 2,
            pagination: {
                current: '2015-08-30',
                currentTs: 1440979199,
                isToday: false,
                more: false,
                next: '2015-08-31',
                prev: '2015-08-29'
            }
        };

        const hashes = [
            '00000000000006bd8fe9e53780323c0e85719eca771022e1eb6d10c62195c441',
            '000000000008fbb2e358e382a6f6948b2da24563bba183af447e6e2542e8efc7'
        ];

        before(function () {
            sinon.stub(Blockchain.prototype, 'getRawBlock')
                .onFirstCall().resolves(Buffer.from(blocks['000000000008fbb2e358e382a6f6948b2da24563bba183af447e6e2542e8efc7'], 'hex'))
                .onSecondCall().resolves(Buffer.from(blocks['00000000000006bd8fe9e53780323c0e85719eca771022e1eb6d10c62195c441'], 'hex'));
            sinon.stub(Blockchain.prototype, 'getBlockHeader')
                .onFirstCall().resolves(blockIndexes['000000000008fbb2e358e382a6f6948b2da24563bba183af447e6e2542e8efc7'])
                .onSecondCall().resolves(blockIndexes['00000000000006bd8fe9e53780323c0e85719eca771022e1eb6d10c62195c441']);
            sinon.stub(Blockchain.prototype, 'getBlockHashesByTimestamp').resolves(hashes);
        });

        after(function () {
            Blockchain.prototype.getRawBlock.restore();
            Blockchain.prototype.getBlockHeader.restore();
            Blockchain.prototype.getBlockHashesByTimestamp.restore();
        });

        it('should have correct data', function () {
            return request(this.service.server.listener)
                .get('/blocks?limit=2&blockDate=2015-08-30')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    should(res.body).eql(insight);
                });
        });
    });

    describe('/block-index/:height route', function () {
        before(function () {
            sinon.stub(Blockchain.prototype, 'getBlockHeader').resolves(blockIndexes[533974]);
        });

        after(function () {
            Blockchain.prototype.getBlockHeader.restore();
        });

        it('should have correct data', function () {
            const insight = {
                blockHash: '0000000000000afa0c3c0afd450c793a1e300ec84cbe9555166e06132f19a8f7'
            };

            const height = 533974;

            return request(this.service.server.listener)
                .get(`/block-index/${height}`)
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    should(res.body).eql(insight);
                });
        });
    });

    describe('#getBlockReward', function () {

        it('should give a block reward of 50 * 1e8 for block before first halvening', function () {
            controller._getBlockReward(100000).should.equal(50 * 1e8);
        });

        it('should give a block reward of 25 * 1e8 for block between first and second halvenings', function () {
            controller._getBlockReward(373011).should.equal(25 * 1e8);
        });

        it('should give a block reward of 12.5 * 1e8 for block between second and third halvenings', function () {
            controller._getBlockReward(500000).should.equal(12.5 * 1e8);
        });
    });
});
