const owsCommon = require('@owstack/ows-common');
const BN = owsCommon.BN;
const encoding = owsCommon.encoding;
const common = require('./common');
const LRU = require('lru-cache');

const DEFAULT_BLOCKSUMMARY_CACHE_SIZE = 1000000;
const DEFAULT_BLOCK_CACHE_SIZE = 1000;

const blockSummaryCache = new LRU(DEFAULT_BLOCKSUMMARY_CACHE_SIZE);
const blockCache = new LRU(DEFAULT_BLOCK_CACHE_SIZE);

const pools = require('@owstack/mining-pool-meta');

function isHexadecimal(hash) {
    if (typeof hash !== 'string' && !(hash instanceof String)) {
        return false;
    }
    return /^[0-9a-fA-F]+$/.test(hash);
}

const _checkBlockHash = function (hash) {
    if (hash.length < 64 || !isHexadecimal(hash)) {
        return false;
    }
    return true;
};

const _formatTimestamp = function (date) {
    const yyyy = date.getUTCFullYear().toString();
    const mm = (date.getUTCMonth() + 1).toString(); // getMonth() is zero-based
    const dd = date.getUTCDate().toString();

    return `${yyyy  }-${  mm[1] ? mm : `0${  mm[0]}`  }-${  dd[1] ? dd : `0${  dd[0]}`}`; //padding
};

const _getBlockReward = function (height) {
    const halvings = Math.floor(height / 210000);
    // Force block reward to zero when right shift is undefined.
    if (halvings >= 64) {
        return 0;
    }

    // Subsidy is cut in half every 210,000 blocks which will occur approximately every 4 years.
    let subsidy = new BN(50 * 1e8);
    subsidy = subsidy.shrn(halvings);

    return parseInt(subsidy.toString(10));
};

const _getBlockSummary = async function (req, h, hash, moreTimestamp) {

    function finish(result) {
        if (moreTimestamp > result.time) {
            moreTimestamp = result.time;
        }
        return result;
    }

    const summaryCache = blockSummaryCache.get(hash);

    if (summaryCache) {
        return finish(summaryCache);
    }

    let blockBuffer;
    try {
        blockBuffer = await req.server.app.blockchain.getRawBlock(hash);
    } catch (e) {
        throw e;
    }

    const br = new encoding.BufferReader(blockBuffer);

    // take a shortcut to get number of transactions and the blocksize.
    // Also reads the coinbase transaction and only that.
    // Old code parsed all transactions in every block _and_ then encoded
    // them all back together to get the binary size of the block.
    // FIXME: This code might still read the whole block. Fixing that
    // would require changes in btc-node.
    const header = req.server.app.blockchain.coinLib.BlockHeader.fromBufferReader(br);
    const info = {};
    const txlength = br.readVarintNum();
    info.transactions = [req.server.app.blockchain.coinLib.Transaction().fromBufferReader(br)];

    let blockHeader;
    try {
        blockHeader = await req.server.app.blockchain.getBlockHeader(hash);
    } catch (e) {
        throw e;
    }

    const height = blockHeader.height;

    const summary = {
        height: height,
        size: blockBuffer.length,
        hash: hash,
        time: header.time,
        txlength: txlength,
        poolInfo: _getPoolInfo(req.server.app.blockchain.options.currency.toLowerCase(), info)
    };

    const confirmations = req.server.app.blockchain.height - height + 1;
    if (confirmations >= req.server.app.blockchain.blockCacheConfirmations) {
        blockSummaryCache.set(hash, summary);
    }

    return finish(summary);
};

const _getPoolInfo = function (currency, block) {
    const poolStrings = {};
    pools[currency.toLowerCase()].forEach(function (pool) {
        pool.searchStrings.forEach(function (s) {
            poolStrings[s] = {
                poolName: pool.poolName,
                url: pool.url
            };
        });
    });

    const coinbaseBuffer = block.transactions[0].inputs[0]._scriptBuffer;

    for (const k in poolStrings) {
        if (coinbaseBuffer.toString('utf-8').match(k)) {
            return poolStrings[k];
        }
    }

    return {};
};

const _normalizePrevHash = function (hash) {
    // TODO fix btc to give back null instead of null hash
    if (hash !== '0000000000000000000000000000000000000000000000000000000000000000') {
        return hash;
    } else {
        return null;
    }
};

const _transformBlock = function (block, info, currency) {
    const blockObj = block.toObject();
    const transactionIds = blockObj.transactions.map(function (tx) {
        return tx.hash;
    });
    return {
        hash: block.hash,
        size: block.toBuffer().length,
        height: info.height,
        version: blockObj.header.version,
        merkleroot: blockObj.header.merkleRoot,
        tx: transactionIds,
        time: blockObj.header.time,
        nonce: blockObj.header.nonce,
        bits: blockObj.header.bits.toString(16),
        difficulty: block.header.getDifficulty(),
        chainwork: info.chainWork,
        confirmations: info.confirmations,
        previousblockhash: _normalizePrevHash(blockObj.header.prevHash),
        nextblockhash: info.nextHash,
        reward: _getBlockReward(info.height) / 1e8,
        isMainChain: (info.confirmations !== -1),
        poolInfo: _getPoolInfo(currency, block)
    };
};

const blockIndex = async function (req, h) {
    const height = req.params.height;
    let info;

    try {
        info = await req.server.app.blockchain.getBlockHeader(height);
    } catch (e) {
        return common.handleErrors(req, h, e);
    }

    if (!info.hash) {
        return common.handleErrors(req, h, null);
    }

    return h.response({blockHash: info.hash}).code(200);
};

const list = async function (req, h) {
    const DEFAULT_BLOCK_LIMIT = 20;

    let dateStr;
    const todayStr = _formatTimestamp(new Date());
    let isToday;

    if (req.query.blockDate) {
        dateStr = req.query.blockDate;
        const datePattern = /\d{4}-\d{2}-\d{2}/;
        if (!datePattern.test(dateStr)) {
            return common.handleErrors(req, h, new Error('Please use yyyy-mm-dd format'));
        }

        isToday = dateStr === todayStr;
    } else {
        dateStr = todayStr;
        isToday = true;
    }

    const gte = Math.round((new Date(dateStr)).getTime() / 1000);

    //pagination
    const lte = parseInt(req.query.startTimestamp) || gte + 86400;
    const prev = _formatTimestamp(new Date((gte - 86400) * 1000));
    const next = lte ? _formatTimestamp(new Date(lte * 1000)) : null;
    const limit = parseInt(req.query.limit || DEFAULT_BLOCK_LIMIT);
    let more = false;
    const moreTimestamp = lte;

    let hashes = [];
    try {
        hashes = await req.server.app.blockchain.getBlockHashesByTimestamp(lte, gte);
    } catch (err) {
        return common.handleErrors(req, h, err);
    }

    hashes.reverse();

    if (hashes.length > limit) {
        more = true;
        hashes = hashes.slice(0, limit);
    }

    const blocks = [];
    for (const hash of hashes) {
        try {
            const block = await _getBlockSummary(req, h, hash, moreTimestamp);
            blocks.push(block);
        } catch (e) {
            return common.handleErrors(req, h, e);
        }
    }

    blocks.sort(function (a, b) {
        return b.height - a.height;
    });

    const data = {
        blocks: blocks,
        length: blocks.length,
        pagination: {
            next: next,
            prev: prev,
            currentTs: lte - 1,
            current: dateStr,
            isToday: isToday,
            more: more
        }
    };

    if (more) {
        data.pagination.moreTs = moreTimestamp;
    }

    return h.response(data).code(200);
};

const show = async function (req, h) {
    const hash = req.params.hash;
    if (!_checkBlockHash(hash)) {
        return common.handleErrors(req, h, null);
    }

    const blockCached = blockCache.get(hash);
    if (blockCached) {
        return h.response(blockCached).code(200);
    }

    let block;
    let info;

    try {
        block = await req.server.app.blockchain.getBlock(hash);
        info = await req.server.app.blockchain.getBlockHeader(hash);
    } catch (err) {
        if ((err.code === -5) || (err.code === -8)) {
            return common.handleErrors(req, h, null);
        }

        return common.handleErrors(req, h, err);
    }

    const blockResult = _transformBlock(block, info, req.server.app.blockchain.options.currency.toLowerCase());
    if (blockResult.confirmations >= req.server.app.blockchain.blockCacheConfirmations) {
        blockCache.set(hash, blockResult);
    }
    return h.response(blockResult).code(200);
};

const showRaw = async function (req, h) {
    const hash = req.params.hash;
    if (!_checkBlockHash(hash)) {
        return common.handleErrors(req, h, null);
    }

    let blockBuffer;

    try {
        blockBuffer = await req.server.app.blockchain.getRawBlock(hash);
    } catch (err) {
        if ((err.code === -5) || (err.code === -8)) {
            return common.handleErrors(req, h, null);
        }

        return common.handleErrors(req, h, err);
    }

    return h.response({rawblock: blockBuffer.toString('hex')}).code(200);
};

module.exports = {
    _getBlockReward,

    blockIndex,
    list,
    show,
    showRaw
};
