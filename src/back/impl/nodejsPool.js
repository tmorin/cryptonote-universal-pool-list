import {httpGet} from '../utils';
import {conf, HTTP_OPTIONS} from '../config';

export function fetchNodejsPoolImpl(server) {
    const configUrl = `${server.back}/config`;
    const statsUrl = `${server.back}/pool/stats`;
    return Promise.all([
        httpGet(configUrl, HTTP_OPTIONS),
        httpGet(statsUrl, HTTP_OPTIONS)
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
                coinUnits: config.min_denom * 1000,
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
    }).catch(error => {
        console.error(error);
        return Object.assign({
            error: error.message
        }, server);
    });
}

export function checkAddressFromNodejsPool(server, address) {
    const url = `${server.back}/miner/${address}/stats`;

    return httpGet(url, HTTP_OPTIONS).then(response => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
            const body = JSON.parse(response.body);

            if (body.lastHash) {
                return Object.assign({
                    address: {
                        stats: {
                            hashrate: body.hash,
                            hashes: body.totalHashes,
                            lastShare: `${body.lastHash}`,
                            balance: body.amtDue,
                            paid: body.amtPaid
                        }
                    }
                }, server);
            }

            return Object.assign({error: true}, server);
        }

        return Object.assign({
            error: `${url} returned an error`
        }, server);

    }).catch(error => {
        console.error(error);
        return Object.assign({
            error: error.message
        }, server);
    });
}