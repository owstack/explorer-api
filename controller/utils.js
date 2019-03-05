const owsCommon = require('@owstack/ows-common');
const _ = owsCommon.deps.lodash;
const common = require('./common');

const estimateFee = async function (req, h) {
    const args = req.query.nbBlocks || '2';
    const nbBlocks = args.split(',');

    const fees = [];
    for (const n of nbBlocks) {
        let fee;
        try {
            const num = parseInt(n);
            if (req.server.app.blockchain.options.currency === 'BCH') {
                fee = await req.server.app.blockchain.estimateFee(num);
                fees.push([num, fee]);
            } else {
                fee = await req.server.app.blockchain.estimateSmartFee(num);
                fees.push([num, fee.feerate]);
            }
        } catch (e) {
            return common.handleErrors(req, h, e);
        }
    }

    return h.response(_).code(200);
};

module.exports = {
    estimateFee
};
