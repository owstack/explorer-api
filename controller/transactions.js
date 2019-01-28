const conf = require('../config');
const config = conf.get();

const owsCommon = require('@owstack/ows-common');
const _ = owsCommon.deps.lodash;
const common = require('./common');

const _transformTransaction = function (req, transaction, options = {}) {
    let confirmations = 0;
    if (transaction.height >= 0) {
        confirmations = req.server.app.blockchain.height - transaction.height + 1;
    }

    const transformed = {
        txid: transaction.hash,
        version: transaction.version,
        locktime: transaction.locktime
    };

    if (transaction.coinbase) {
        transformed.vin = [
            {
                coinbase: transaction.inputs[0].script,
                sequence: transaction.inputs[0].sequence,
                n: 0
            }
        ];
    } else {
        transformed.vin = transaction.inputs.map((input, index) => {
            return _transformInput(options, input, index);
        });
    }

    transformed.vout = transaction.outputs.map((output, index) => {
        return _transformOutput(req, options, output, index);
    });

    transformed.blockhash = transaction.blockHash;
    transformed.blockheight = transaction.height;
    transformed.confirmations = confirmations;
    // TODO consider mempool txs with receivedTime?
    const time = transaction.blockTimestamp ? transaction.blockTimestamp : Math.round(Date.now() / 1000);
    transformed.time = time;
    if (transformed.confirmations) {
        transformed.blocktime = transformed.time;
    }

    if (transaction.coinbase) {
        transformed.isCoinBase = true;
    }

    transformed.valueOut = transaction.outputSatoshis / 1e8;
    transformed.size = transaction.size; // can be virtual size (not equal to actual) if segwit
    if (!transaction.coinbase) {
        transformed.valueIn = transaction.inputSatoshis / 1e8;
        transformed.fees = transaction.feeSatoshis / 1e8;
    }

    return transformed;
};

const _getTransaction = async function (req) {
    const txid = req.params.txid;
    let transaction;
    let transformed;
    try {
        transaction = await req.server.app.blockchain.getDetailedTransaction(txid);
        transformed = _transformTransaction(req, transaction);
    } catch (e) {
        throw e;
    }

    return transformed;
};

const _transformInput = function (options, input, index) {
    // Input scripts are validated and can be assumed to be valid
    const transformed = {
        txid: input.prevTxId,
        vout: input.outputIndex,
        sequence: input.sequence,
        n: index
    };

    if (!options.noScriptSig) {
        transformed.scriptSig = {
            hex: input.script
        };
        if (!options.noAsm) {
            transformed.scriptSig.asm = input.scriptAsm;
        }
    }

    transformed.addr = input.address;
    transformed.valueSat = input.satoshis;
    transformed.value = input.satoshis / 1e8;
    transformed.doubleSpentTxID = null; // TODO
    //transformed.isConfirmed = null; // TODO
    //transformed.confirmations = null; // TODO
    //transformed.unconfirmedInput = null; // TODO

    return transformed;
};

const _transformOutput = function (req, options, output, index) {
    const transformed = {
        value: (output.satoshis / 1e8).toFixed(8),
        n: index,
        scriptPubKey: {
            hex: output.script
        }
    };

    if (!options.noAsm) {
        transformed.scriptPubKey.asm = output.scriptAsm;
    }

    if (!options.noSpent) {
        transformed.spentTxId = output.spentTxId || null;
        transformed.spentIndex = _.isUndefined(output.spentIndex) ? null : output.spentIndex;
        transformed.spentHeight = output.spentHeight || null;
    }

    if (output.address) {
        transformed.scriptPubKey.addresses = [output.address];
        const address = req.server.app.blockchain.coinLib.Address(output.address); //TODO return type from btc-node
        transformed.scriptPubKey.type = address.type;
    }
    return transformed;
};

const _transformInvTransaction = function (transaction) {
    let valueOut = 0;
    const vout = [];
    for (let i = 0; i < transaction.outputs.length; i++) {
        const output = transaction.outputs[i];
        valueOut += output.satoshis;
        if (output.script) {
            const address = output.script.toAddress();
            if (address) {
                const obj = {};
                obj[address.toString()] = output.satoshis;
                vout.push(obj);
            }
        }
    }

    const isRBF = _.some(_.map(transaction.inputs, 'sequenceNumber'), function (seq) {
        const MAXINT = 0xffffffff; // Math.pow(2, 32) - 1;
        return seq < MAXINT - 1;
    });

    const transformed = {
        txid: transaction.hash,
        valueOut: valueOut / 1e8,
        vout: vout,
        isRBF: isRBF,
    };

    return transformed;
};

const _getRawTransaction = async function (req) {
    const txid = req.params.txid;
    let transaction;
    let transformed;
    try {
        transaction = await req.server.app.blockchain.getTransaction(txid);
        transformed = {
            rawtx: transaction.toBuffer().toString('hex')
        };
    } catch (e) {
        throw e;
    }

    return transformed;
};

const show = async function (req, h) {
    let transaction;
    try {
        transaction = await _getTransaction(req);
    } catch (e) {
        if (e.code === -5) {
            return common.handleErrors(req, h, null);
        }
        return common.handleErrors(req, h, e);
    }

    return h.response(transaction).code(200);
};

const showRaw = async function (req, h) {
    let transaction;
    try {
        transaction = await _getRawTransaction(req);
    } catch (e) {
        if (e.code === -5) {
            return common.handleErrors(req, h, null);
        }
        return common.handleErrors(req, h, e);
    }

    return h.response(transaction).code(200);
};

const list = async function (req, h) {
    const blockHash = req.query.block;
    const address = req.query.address;
    const page = parseInt(req.query.pageNum) || 0;
    const pageLength = 10;
    let pagesTotal = 1;
    const txs = [];

    if (blockHash) {
        let block;
        let txids;

        try {
            block = await req.server.app.blockchain.getBlockOverview(blockHash);
            const totalTxs = block.txids.length;

            if (!_.isUndefined(page)) {
                const start = page * pageLength;
                txids = block.txids.slice(start, start + pageLength);
                pagesTotal = Math.ceil(totalTxs / pageLength);
            } else {
                txids = block.txids;
            }

            for (const txid of txids) {
                try {
                    const detailedTx = await req.server.app.blockchain.getDetailedTransaction(txid);
                    const transformed = _transformTransaction(req, detailedTx);
                    txs.push(transformed);
                } catch (e) {
                    throw e;
                }
            }

        } catch (e) {
            if (e.code === -5) {
                return common.handleErrors(req, h, null);
            }
            return common.handleErrors(req, h, e);
        }
    } else if (address) {
        const options = {
            from: page * pageLength,
            to: (page + 1) * pageLength
        };

        let addressHistory;
        try {
            addressHistory = await req.server.app.blockchain.getAddressHistory(address, options);
        } catch (e) {
            return common.handleErrors(req, h, e);
        }

        const txs2 = addressHistory.items.map(function (info) {
            return info.tx;
        }).filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });

        for (const tx of txs2) {
            const transformed = _transformTransaction(req, tx);
            txs.push(transformed);
        }
    } else {
        return common.handleErrors(req, h, new Error('Block hash or address expected'));
    }

    return h.response({pagesTotal, txs}).code(200);
};

const send = async function (req, h) {
    let txid;
    try {
        txid = await req.server.app.blockchain.sendTransaction(req.payload.rawtx);
    } catch (e) {
        return common.handleErrors(req, h, e);
    }

    return h.response({txid}).code(201);
};

module.exports = {
    _getRawTransaction,
    _getTransaction,
    _transformInvTransaction,
    _transformInput,
    _transformOutput,
    _transformTransaction,

    show,
    showRaw,
    list,
    send
};
