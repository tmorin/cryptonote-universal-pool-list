import {httpGet} from '../utils';
import {conf, HTTP_TIMEOUT} from '../config';

export function fetchNodejsPoolImpl(server) {
    const configUrl = `${server.back}/config`;
    const statsUrl = `${server.back}/pool/stats`;
    const options = {timeout: HTTP_TIMEOUT};
    return Promise.all([
        httpGet(configUrl, options),
        httpGet(statsUrl, options)
    ]).then(responses => {
        const fetchSucceed = responses
            .filter(res => res.statusCode >= 200 && res.statusCode < 300)
            .length > 0;

        if (!fetchSucceed) {
            return Object.assign({
                error: `${server.back} returned an error`
            }, server);
        }

        const config = JSON.parse(responses[0].body);
        const stats = JSON.parse(responses[1].body);
        const result = {
            config: {
                fee: config.pplns_fee,
                minPaymentThreshold: config.min_wallet_payout,
                coin: conf('currency').tech_name,
                symbol: conf('currency').symbol
            },
            pool: {
                hashrate: stats.pool_statistics.hashRate,
                miners: stats.pool_statistics.miners,
                totalBlocks: stats.pool_statistics.totalBlocksFound,
                totalMinersPaid: stats.pool_statistics.totalMinersPaid,
                lastBlockFound: stats.pool_statistics.lastBlockFoundTime * 1000,
                totalPayments: stats.pool_statistics.totalPayments
            }
        };

        return Object.assign({
            stats: result
        }, server);
    });
}
