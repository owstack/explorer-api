const should = require('should');
const sinon = require('sinon');
const {Blockchain} = require('@owstack/hapi-blockchain');
const request = require('supertest');

describe('Utils', function () {
    describe('/utils/estimatefee', function () {
        before(function () {
            sinon.stub(Blockchain.prototype, 'estimateSmartFee')
                .onFirstCall().resolves(1000 / 1e8)
                .onSecondCall().resolves(3000 / 1e8);
        });

        after(function () {
            Blockchain.prototype.estimateSmartFee.restore();
        });

        it('should give the correct fee', function () {

            return request(this.service.server.listener)
                .get('/utils/estimatefee?nbBlocks=1,3')
                .set('Accept', 'application/json')
                .expect(200)
                .then((res) => {
                    should(res.body).eql({1: 0.00001, 3: 0.00003});
                });
        });
    });
});
