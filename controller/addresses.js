const txController = require('./transactions');
const common = require('./common');

const _addressSummarySubQuery = async function (req, h, param) {
    const address = req.params.addr;
    try {
        await _checkAddr(req, address);
    } catch (e) {
        return common.handleErrors(req, h, {
            message: e.message,
            code: 1
        });
    }

    let data;
    try {
        data = await _getAddressSummary(req, address);
    } catch (e) {
        return common.handleErrors(req, h, e);
    }


    return h.response(data[param]).code(200);
};

const _checkAddr = function (req, address) {
    return _checkOneOrMoreAddresses(req, [address]);
};

const _checkAddrs = function (req, addressesString) {
    const addresses = addressesString.split(',');
    return _checkOneOrMoreAddresses(req, addresses);
};

const _checkOneOrMoreAddresses = function (req, addresses) {
    if (!addresses.length || !addresses[0]) {
        throw new Error('Must include address');
    }

    for (let i = 0; i < addresses.length; i++) {
        try {
            new req.server.app.blockchain.coinLib.Address(addresses[i]);
        } catch (e) {
            throw new Error(`Invalid address: ${  e.message}`);
        }
    }

    return true;
};

const _getAddressSummary = async function (req, address, options = {}) {
    let summary;
    try {
        summary = await req.server.app.blockchain.getAddressSummary(address, options);
    } catch (e) {
        throw e;
    }

    const transformed = {
        addrStr: address,
        balance: req.server.app.blockchain.coinLib.Unit.fromAtomicUnit(summary.balance).toBTC(),
        balanceSat: summary.balance,
        totalReceived: req.server.app.blockchain.coinLib.Unit.fromAtomicUnit(summary.totalReceived).toBTC(),
        totalReceivedSat: summary.totalReceived,
        totalSent: req.server.app.blockchain.coinLib.Unit.fromAtomicUnit(summary.totalSpent).toBTC(),
        totalSentSat: summary.totalSpent,
        unconfirmedBalance: req.server.app.blockchain.coinLib.Unit.fromAtomicUnit(summary.unconfirmedBalance).toBTC(),
        unconfirmedBalanceSat: summary.unconfirmedBalance,
        unconfirmedTxApperances: summary.unconfirmedAppearances, // misspelling - ew
        txApperances: summary.appearances, // yuck
        transactions: summary.txids
    };

    return transformed;
};

const _getTransformOptions = function (req) {
    return {
        noAsm: parseInt(req.query.noAsm) ? true : false,
        noScriptSig: parseInt(req.query.noScriptSig) ? true : false,
        noSpent: parseInt(req.query.noSpent) ? true : false
    };
};

const _transformUtxo = function (req, utxoArg) {
    const utxo = {
        address: utxoArg.address,
        txid: utxoArg.txid,
        vout: utxoArg.outputIndex,
        scriptPubKey: utxoArg.script,
        amount: utxoArg.satoshis / 1e8,
        satoshis: utxoArg.satoshis
    };
    if (utxoArg.height && utxoArg.height > 0) {
        utxo.height = utxoArg.height;
        utxo.confirmations = req.server.app.blockchain.height - utxoArg.height + 1;
    } else {
        utxo.confirmations = 0;
    }
    if (utxoArg.timestamp) {
        utxo.ts = utxoArg.timestamp;
    }
    return utxo;
};

const _transformAddressHistoryForMultiTxs = async function (req, txinfos, options) {
    const items = txinfos.map(function (txinfo) {
        return txinfo.tx;
    }).filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });

    const transformedItems = [];
    for (const item of items) {
        try {
            const transformedItem = await txController._transformTransaction(req, item, options);
            transformedItems.push(transformedItem);
        } catch (e) {
            throw e;
        }
    }
    return transformedItems;
};

const balance = function (req, h) {
    return _addressSummarySubQuery(req, h, 'balanceSat');
};

const show = async function (req, h) {
    const options = {
        noTxList: parseInt(req.query.noTxList)
    };

    if (req.query.from && req.query.to) {
        options.from = parseInt(req.query.from);
        options.to = parseInt(req.query.to);
    }

    const address = req.params.addr;
    try {
        await _checkAddr(req, address);
    } catch (e) {
        return common.handleErrors(req, h, {
            message: e.message,
            code: 1
        });
    }

    let data;
    try {
        data = await _getAddressSummary(req, address, options);
    } catch (e) {
        return common.handleErrors(req, h, e);
    }

    return h.response(data).code(200);
};

const totalReceived = function (req, h) {
    return _addressSummarySubQuery(req, h, 'totalReceivedSat');
};

const totalSent = function (req, h) {
    return _addressSummarySubQuery(req, h, 'totalSentSat');
};

const unconfirmedBalance = function (req, h) {
    return _addressSummarySubQuery(req, h, 'unconfirmedBalanceSat');
};

const utxo = async function (req, h) {
    const address = req.params.addr;
    try {
        await _checkAddr(req, address);
    } catch (e) {
        return common.handleErrors(req, h, {
            message: e.message,
            code: 1
        });
    }

    let utxos;
    try {
        utxos = await req.server.app.blockchain.getAddressUnspentOutputs(address, {});
    } catch (e) {
        return common.handleErrors(req, h, e);
    }

    if (!utxos.length) {
        return h.response([]).code(200);
    }

    return h.response(utxos.map((utxo) => {
        return _transformUtxo(req, utxo);
    })).code(200);
};

// used in both POST and GET
const multiutxo = async function (req, h) {
    const addresses = req.params.addrs || req.payload.addrs;
    try {
        await _checkAddrs(req, addresses);
    } catch (e) {
        return common.handleErrors(req, h, {
            message: e.message,
            code: 1
        });
    }

    let utxos;
    try {
        utxos = await req.server.app.blockchain.getAddressUnspentOutputs(addresses.split(','), {});
    } catch (e) {
        if (e.code === -5) {
            return h.response([]).code(200);
        }
        return common.handleErrors(req, h, e);
    }

    return h.response(utxos.map((utxo) => {
        return _transformUtxo(req, utxo);
    })).code(200);
};

// used in both POST and GET
const multitxs = async function (req, h) {
    req.payload = req.payload || {};
    const options = {
        from: parseInt(req.query.from) || parseInt(req.payload.from) || 0,
    };

    options.to = parseInt(req.query.to) || parseInt(req.payload.to) || parseInt(options.from) + 10;

    const addresses = req.params.addrs || req.payload.addrs;
    try {
        await _checkAddrs(req, addresses);
    } catch (e) {
        return common.handleErrors(req, h, {
            message: e.message,
            code: 1
        });
    }

    let addressHistory;
    let transforedAddressHistory;
    try {
        addressHistory = await req.server.app.blockchain.getAddressHistory(addresses, options);
        const transformOptions = _getTransformOptions(req);
        transforedAddressHistory = await _transformAddressHistoryForMultiTxs(req, addressHistory.items, transformOptions);
    } catch (e) {
        return common.handleErrors(req, h, e);
    }

    return h.response({
        totalItems: addressHistory.totalCount,
        from: options.from,
        to: Math.min(options.to, addressHistory.totalCount),
        items: transforedAddressHistory
    }).code(200);

};

module.exports = {
    _addressSummarySubQuery,
    _checkAddr,
    _checkAddrs,
    _checkOneOrMoreAddresses,
    _getAddressSummary,
    _getTransformOptions,
    _transformAddressHistoryForMultiTxs,
    _transformUtxo,

    show,
    balance,
    totalReceived,
    totalSent,
    unconfirmedBalance,
    utxo,

    multiutxo,
    multitxs,
};
