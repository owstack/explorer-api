const request = require('request-promise-native');
const owsCommon = require('@owstack/ows-common');
const _ = owsCommon.deps.lodash;

const DEFAULT_CURRENCY_DELAY = 10;

const rateSources = function (baseCurrencyCode) {
    const curr = baseCurrencyCode.toLowerCase();
    return {
        USD: {
            providers: [{
                name: 'Bitstamp',
                url: `https://www.bitstamp.net/api/v2/ticker/${curr}usd`,
                path: 'last', // path to result
            }],
            unit: {
                name: 'US Dollar',
                shortName: 'USD',
                value: 0, // Fetched by client
                decimals: 2,
                code: 'USD',
                kind: 'fiat'
            }
        },
        EUR: {
            providers: [{
                name: 'Bitstamp',
                url: `https://www.bitstamp.net/api/v2/ticker/${curr}eur`,
                path: 'last', // path to result
            }],
            unit: {
                name: 'Euro',
                shortName: 'EUR',
                value: 0, // Fetched by client
                decimals: 2,
                code: 'EUR',
                kind: 'fiat'
            }
        }
    };
};

const _getUnits = function (req) {
    return _.map(Object.keys(rateSources(req.server.app.blockchain.options.currency)), function (k) {
        return rateSources(req.server.app.blockchain.options.currency)[k].unit;
    });
};

const rates = {};
let timestamp = Date.now();
const currencyDelay = DEFAULT_CURRENCY_DELAY * 60000;

const index = async function (req, h) {
    const currentTime = Date.now();

    if (_.isEmpty(rates) || currentTime >= (timestamp + currencyDelay)) {
        timestamp = currentTime;

        for (const currency of Object.keys(rateSources(req.server.app.blockchain.options.currency))) {
            for (const provider of rateSources(req.server.app.blockchain.options.currency)[currency].providers) {
                try {
                    const body = await request.get(provider.url);
                    rates[currency] = rates[currency] || [];
                    rates[currency] = _.filter(rates[currency], function (c) {
                        return c.name != provider.name;
                    });
                    rates[currency].push({
                        name: provider.name,
                        rate: parseFloat(_.get(JSON.parse(body), provider.path))
                    });
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    return h.response({
        status: 200,
        data: {rates}
    });
};

module.exports = {
    index,
    _getUnits,
    _rates: rates
};
