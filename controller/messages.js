const Message = require('@owstack/message-lib');
const owsCommon = require('@owstack/ows-common');
const _ = owsCommon.deps.lodash;
const common = require('./common');

const verify = function (req, h) {
    req.payload = req.payload || {};
    const address = req.payload.address || req.query.address;
    const signature = req.payload.signature || req.query.signature;
    const message = req.payload.message || req.query.message;

    if (_.isUndefined(address) || _.isUndefined(signature) || _.isUndefined(message)) {
        return common.handleErrors(req, h, {
            message: 'Missing parameters (expected "address", "signature" and "message")',
            code: 1
        });
    }
    let valid;
    try {
        valid = new Message(message, req.server.app.blockchain.options.currency.toLowerCase()).verify(address, signature);
    } catch (err) {
        return common.handleErrors(req, h, {
            message: `Unexpected error: ${err.message}`,
            code: 1
        });
    }
    return h.response({result: valid}).code(200);
};

module.exports = {
    verify
};
