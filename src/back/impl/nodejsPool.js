import {httpGet} from '../utils';
import {conf, HTTP_OPTIONS} from '../config';

export function fetchNodejsPoolImpl(server) {
    const configUrl = `${server.back}/config`;
    const statsUrl = `${server.back}/pool/stats`;
    const networkUrl = `${server.back}/network/stats`;
    return Promise.all([
        httpGet(configUrl, HTTP_OPTIONS),
        httpGet(statsUrl, HTTP_OPTIONS),
        httpGet(networkUrl, HTTP_OPTIONS)
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
        const poolStats = JSON.parse(responses[1].body);
        const networkStats = JSON.parse(responses[2].body);

        const networkHashRate = Math.floor(networkStats.difficulty / conf('currency').difficultyTarget);
        const poolHashRate = poolStats.pool_statistics.hashRate;
        const percent = poolHashRate * 100 / networkHashRate;
        const hashRate = {
            network: networkHashRate,
            poolHash: poolHashRate,
            percent
        };

        const result = {
            config: {
                fee: config.pplns_fee,
                minPaymentThreshold: config.min_wallet_payout,
                coin: conf('currency').tech_name,
                min_denom: config.min_denom,
                symbol: conf('currency').symbol
            },
            pool: {
                hashrate: poolStats.pool_statistics.hashRate,
                miners: poolStats.pool_statistics.miners,
                totalBlocks: poolStats.pool_statistics.totalBlocksFound,
                totalMinersPaid: poolStats.pool_statistics.totalMinersPaid,
                lastBlockFound: poolStats.pool_statistics.lastBlockFoundTime * 1000,
                totalPayments: poolStats.pool_statistics.totalPayments
            }
        };

        return Object.assign({
            stats: result, hashRate
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