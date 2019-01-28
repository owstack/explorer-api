const should = require('should');
const sinon = require('sinon');
const request = require('supertest');
const currency = require('../controller/currency');

const rp = require('request-promise-native');

describe('Currency', function () {

    const bitstampData = {
        high: 239.44,
        last: 237.90,
        timestamp: 1443798711,
        bid: 237.61,
        vwap: 237.88,
        volume: 21463.27736401,
        low: 235.00,
        ask: 237.90
    };

    it('will make live request to bitstamp', function () {
        return request(this.service.server.listener)
            .get('/currency')
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
                should.exist(res.body.data.rates.USD[0].rate);
                (typeof res.body.data.rates.USD[0].rate).should.equal('number');
            });
    });

    it('will retrieve a fresh value', function () {
        sinon.stub(rp, 'get').resolves(JSON.stringify(bitstampData));
        const timestamp = Date.now() + 61000 * 10;
        sinon.stub(Date, 'now').returns(timestamp);

        currency._rates.USD = [{
            name: 'Bitstamp',
            rate: 220.20
        }];
        currency._rates.EUR = [{
            name: 'Bitstamp',
            rate: 190.10
        }];

        return request(this.service.server.listener)
            .get('/currency')
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
                should.exist(res.body.data.rates.USD[0].rate);
                should.exist(res.body.data.rates.EUR[0].rate);
                res.body.data.rates.USD[0].rate.should.equal(237.90);
                res.body.data.rates.EUR[0].rate.should.equal(237.90);
                rp.get.restore();
                Date.now.restore();
            });
    });

    it('will retrieve a cached value', function () {
        sinon.stub(rp, 'get');

        currency._rates.USD = [{
            name: 'Bitstamp',
            rate: 448.60
        }, {
            name: 'Bitcoin.com',
            rate: 448.60
        }];
        currency._rates.EUR = [{
            name: 'Bitstamp',
            rate: 367.30
        }, {
            name: 'Bitcoin.com',
            rate: 367.30
        }];

        return request(this.service.server.listener)
            .get('/currency')
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
                should.exist(res.body.data.rates.USD[0].rate);
                res.body.data.rates.USD[0].rate.should.equal(448.60);
                rp.get.callCount.should.equal(0);
                rp.get.restore();
            });
    });

});
