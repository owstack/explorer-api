const request = require('supertest');
const urlencode = require('urlencode');

describe('Messages', function () {
    const address = 'mswTKCE2tYSFvUNnNPBKZfeNmugYL1rZMx';
    const badAddress = 'mswTKCE2tYSFvUNnNPBKZfeNmuhYL1rZMm';
    const signature = 'IA4sIwhcLMPPsYtB8tN0PI+aQuwDyl+/4Ksa89llNSAeVaRdMyyIxpo1H5N3GHbPl9LQqZ7CvaokeQgsOkK9fn4=';
    const message = 'cellar door';

    it('will verify a message (true)', function () {
        return request(this.service.server.listener)
            .get(`/messages/verify?address=${address}&signature=${urlencode(signature)}&message=${urlencode(message)}`)
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
                res.body.result.should.equal(true);
            });
    });

    it('will verify a message (false)', function () {
        return request(this.service.server.listener)
            .get(`/messages/verify?address=${address}&signature=${urlencode(signature)}&message=${urlencode('wrong message')}`)
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
                res.body.result.should.equal(false);
            });
    });

    it('handle an error from message verification', function () {
        return request(this.service.server.listener)
            .get(`/messages/verify?address=${badAddress}&signature=${urlencode(signature)}&message=${urlencode('wrong message')}`)
            .set('Accept', 'application/json')
            .expect(400)
            .then((res) => {
                res.error.text.should.equal('Unexpected error: Checksum mismatch. Code:1');
            });
    });

    it('handle error with missing parameters', function () {
        return request(this.service.server.listener)
            .get('/messages/verify')
            .set('Accept', 'application/json')
            .expect(400)
            .then((res) => {
                res.error.text.should.match(/Invalid request query input/);
            });
    });

});
