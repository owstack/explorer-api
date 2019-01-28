const sinon = require('sinon');
const should = require('should');
const request = require('supertest');
const {Blockchain} = require('@owstack/hapi-blockchain');
// const controller = require('../controller/status');

describe('Status', function () {
    describe('/status', function () {
        const info = {
            version: 110000,
            protocolVersion: 70002,
            blocks: 548645,
            timeOffset: 0,
            connections: 8,
            difficulty: 21546.906405522557,
            testnet: true,
            relayFee: 1000,
            errors: ''
        };

        const outSetInfo = {
            height: 151,
            bestblock: '20b6cc0600037171b8bb634bbd04ea754945be44db8d9199b74798f1abdb382d',
            transactions: 151,
            txouts: 151,
            bytes_serialized: 10431,
            hash_serialized: 'c165d5dcb22a897745ee2ee274b47133b995bbcf8dd4a7572fedad87541c7df8',
            total_amount: 750000000000
        };

        before(function () {
            sinon.stub(Blockchain.prototype, 'getInfo').resolves(info);
            sinon.stub(Blockchain.prototype, 'getBestBlockHash').resolves(outSetInfo.bestblock);
            this.service.server.app.blockchain.tiphash = outSetInfo.bestblock;
        });

        after(function () {
            Blockchain.prototype.getInfo.restore();
            Blockchain.prototype.getBestBlockHash.restore();
        });

        it('getInfo', function () {
            return request(this.service.server.listener)
                .get('/status')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    const data = res.body;
                    should.exist(data.info.version);
                    should.exist(data.info.protocolversion);
                    should.exist(data.info.blocks);
                    should.exist(data.info.timeoffset);
                    should.exist(data.info.connections);
                    should.exist(data.info.difficulty);
                    should.exist(data.info.testnet);
                    should.exist(data.info.relayfee);
                    should.exist(data.info.description);
                    should.exist(data.info.units);
                });
        });

        it('getDifficulty', function () {
            return request(this.service.server.listener)
                .get('/status?q=getDifficulty')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    const data = res.body;
                    should.exist(data.difficulty);
                });
        });

        it('getBestBlockHash', function () {
            return request(this.service.server.listener)
                .get('/status?q=getBestBlockHash')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    const data = res.body;
                    data.bestblockhash.should.equal(outSetInfo.bestblock);
                });
        });

        it('getLastBlockHash', function () {
            return request(this.service.server.listener)
                .get('/status?q=getLastBlockHash')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    const data = res.body;
                    data.syncTipHash.should.equal(outSetInfo.bestblock);
                    data.lastblockhash.should.equal(outSetInfo.bestblock);
                });
        });

    });

    describe('/sync', function () {
        before(function () {
            sinon.stub(Blockchain.prototype, 'isSynced').resolves(true);
            sinon.stub(Blockchain.prototype, 'syncPercentage').resolves(99.99);
            this.service.server.app.blockchain.height = 500000;
        });

        after(function () {
            Blockchain.prototype.isSynced.restore();
            Blockchain.prototype.syncPercentage.restore();
        });

        it('should have correct data', function () {

            const expected = {
                status: 'finished',
                blockChainHeight: 500000,
                syncPercentage: 100,
                height: 500000,
                error: null,
                type: 'owstack explorer-api'
            };

            return request(this.service.server.listener)
                .get('/sync')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    const data = res.body;
                    should(data).eql(expected);
                });
        });
    });

    describe('/peer', function () {
        it('should have correct data', function () {
            return request(this.service.server.listener)
                .get('/peer')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    const data = res.body;
                    should(data.connected).equal(true);
                    should(data.host).eql('localhost');
                    should(data.port).eql(3001);
                });
        });
    });

    describe('/version', function () {
        it('should have correct data', function () {
            const expected = {
                version: require('../package.json').version
            };

            return request(this.service.server.listener)
                .get('/version')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    const data = res.body;
                    should(data).eql(expected);
                });
        });
    });
});
