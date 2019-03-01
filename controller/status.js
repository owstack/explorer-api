const owsCommon = require('@owstack/ows-common');
const _ = owsCommon.deps.lodash;
const common = require('./common');
const currency = require('./currency');

const _getBestBlockHash = async  function (req) {
    let bestblockhash;
    try {
        bestblockhash = await req.server.app.blockchain.getBestBlockHash();
    } catch (e) {
        throw e;
    }

    return {bestblockhash};
};

const _getDifficulty = async function (req) {
    let info;
    try {
        info = await req.server.app.blockchain.getInfo();
    } catch (e) {
        throw e;
    }

    return {difficulty: info.difficulty};
};

const _getInfo = async function (req) {
    let result;
    try {
        result = await req.server.app.blockchain.getInfo();
    } catch (e) {
        throw e;
    }

    const info = {
        version: result.version,
        protocolversion: result.protocolVersion,
        blocks: result.blocks,
        timeoffset: result.timeOffset,
        connections: result.connections,
        proxy: result.proxy,
        difficulty: result.difficulty,
        testnet: result.testnet,
        relayfee: result.relayFee,
        errors: result.errors,
        network: result.network,
        description: {
            name: req.server.app.blockchain.coinLib.Networks.defaultNetwork.description,
            protocol: req.server.app.blockchain.coinLib.URI.getProtocol()
        },
        units: _.concat(req.server.app.blockchain.coinLib.Unit.getUnits(), currency._getUnits(req)),
        subversion: result.subversion,
        localservices: result.localServices
    };

    return {info};
};

const _getLastBlockHash = function (req) {
    const hash = req.server.app.blockchain.tiphash;
    return {
        syncTipHash: hash,
        lastblockhash: hash
    };
};

const show = async function (req, h) {
    const option = req.query.q;

    let result;
    try {
        switch (option) {
            case 'getDifficulty':
                result = await _getDifficulty(req);
                break;
            case 'getLastBlockHash':
                result = _getLastBlockHash(req);
                break;
            case 'getBestBlockHash':
                result = await _getBestBlockHash(req);
                break;
            case 'getInfo':
            default:
                result = await _getInfo(req);
        }
    } catch (e) {
        return common.handleErrors(req, h, e);
    }

    return h.response(result).code(200);
};

const sync = async function (req, h) {
    let status = 'syncing';
    let synced = false;
    let percentage;
    try {
        synced = await req.server.app.blockchain.isSynced();
        percentage = await req.server.app.blockchain.syncPercentage();
    } catch (e) {
        return common.handleErrors(req, h, e);
    }

    if (synced) {
        status = 'finished';
    }

    const info = {
        status: status,
        blockChainHeight: req.server.app.blockchain.height,
        syncPercentage: Math.round(percentage),
        height: req.server.app.blockchain.height,
        error: null,
        type: 'owstack explorer-api'
    };

    return h.response(info).code(200);
};

// Hard coded to make insight ui happy, but not applicable
const peer = function (req, h) {
    return h.response({
        connected: true,
        host: req.server.app.config.externalHostname,
        port: req.server.app.config.externalPort
    }).code(200);
};

const version = function (req, h) {
    const pjson = require('../package.json');
    return h.response({
        version: pjson.version
    }).code(200);
};

module.exports = {
    _getBestBlockHash,
    _getDifficulty,
    _getInfo,
    _getLastBlockHash,

    peer,
    show,
    sync,
    version
};
