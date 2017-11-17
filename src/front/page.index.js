import 'bootstrap';
import 'babel-polyfill';
import 'whatwg-fetch';
import $ from 'jquery';
import moment from 'moment';
import parseUrl from 'url-parse';
import './page.index.less';

function getReadableHashRateString(hashrate) {
    const byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH'];
    let i = 0;
    while (hashrate > 1000) {
        hashrate = hashrate / 1000;
        i++;
    }
    return hashrate.toFixed(2) + byteUnits[i];
}

function getReadableCoins(stats, coins, digits, withoutSymbol) {
    const amount = (parseInt(coins || 0) / stats.config.coinUnits).toFixed(digits || stats.config.coinUnits.toString().length - 1);
    return amount + (withoutSymbol ? '' : (' ' + stats.config.symbol));
}

function floatToString(float) {
    return float.toFixed(6).replace(/[0\.]+$/, '');
}

function fetchServers() {
    const $tbody = $('#serverTable').find('tbody').html(`
        <tr>
            <td colspan="11">
                <div class="made-with lead">
                    made with
                    <i title="... love ..." class="fa fa-fw fa-heart fa-spin"></i>
                    somewhere in
                    <span title="... Switzerland" class="made-with-flag"><i style="color: white;"
                                                                            class="fa fa-plus fa-fw"></i></span>
                </div>
            </td>
        </tr>
    `);
    fetch('./api/servers')
        .then(resp => resp.json())
        .then(({servers, updatedOn}) => {
            $('#poolsUpdatedOn').text(`updated ${moment(updatedOn).fromNow()}`);
            servers.map(server => {
                $('#serverTable').find('tbody').html('');
                const front = parseUrl(server.front).protocol === 'https:';
                const back = parseUrl(server.back).protocol === 'https:';
                return Object.assign(server, {secured: {front, back}});
            }).sort((s1, s2) => {
                if (s1.error && !s2.error) {
                    return 1;
                } else if (!s1.error && s2.error) {
                    return -1;
                } else if (s1.error && s2.error) {
                    return 0;
                } else {
                    return s2.stats.pool.hashrate - s1.stats.pool.hashrate;
                }
            }).forEach(server => {
                const secLvl = server.secured.front + server.secured.back;
                const secCls = secLvl > 1 ? 'table-success' : secLvl < 1 ? 'table-warning' : 'table-warning';
                const secTl = `front: ${server.secured.front ? 'https' : 'http'}<br>back: ${server.secured.back ? 'https' : 'http'}`;
                if (server.error) {
                    const tpl = `
                <tr>
                <td><i class="fa fa-fw fa-thumbs-o-down"></i></td>
                <td colspan="10" class="table-danger text-center"><strong>${ server.key || 'unknown' }</strong> unable to fetch data</td>
                </tr>
                `;
                    $tbody.append(tpl);
                } else {
                    const tpl = `
                <tr>
                <td class="text-center"><i class="fa fa-fw fa-check"></i></td>
                <td data-toggle="tooltip" data-html="true" title="${secTl}" class="${secCls}"><a target="_blank" href="${server.front}">${server.name}</a></td>
                <td>${ server.location || 'unknown' }</td>
                <td class="text-right">${ floatToString(server.stats.config.fee) || 0 }%</td>
                <td class="text-right">${ getReadableCoins(server.stats, server.stats.config.minPaymentThreshold, 3, true) }</td>
                <td class="text-right">${ getReadableHashRateString(server.stats.pool.hashrate) }</td>
                <td class="text-right">${ server.stats.pool.totalBlocks || '0' }</td>
                <!--<td class="text-right">${ moment.unix(parseInt(server.stats.pool.lastBlockFound)).toNow() }</td>-->
                <td class="text-right">${ moment(parseInt(server.stats.pool.lastBlockFound)).fromNow() }</td>
                <td class="text-right">${ server.stats.pool.miners }</td>
                <td class="text-right">${ server.stats.pool.totalMinersPaid }</td>
                <td class="text-right">${ server.stats.pool.totalPayments }</td>
                </tr>
                `;
                    $tbody.append(tpl);
                }
            });
            $('[data-toggle="tooltip"]').tooltip();
        })
        .catch(err => console.error(err));
}

$('body').css({'display': 'block'});
$('[data-toggle="tooltip"]').tooltip();
$('a[name="refreshServers"]').click(evt => {
    evt.preventDefault();
    fetchServers();
});

fetchServers();
