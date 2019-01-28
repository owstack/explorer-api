const sinon = require('sinon');
const {Blockchain} = require('@owstack/hapi-blockchain');
const Service = require('../lib/service');

before(async function () {
    sinon.stub(Blockchain.prototype, 'start').resolves();
    this.service = new Service();
    await this.service.start();
});

after(async function () {
    await this.service.stop();
    Blockchain.prototype.start.restore();
});
