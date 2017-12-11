import {floatToString, getReadableCoins, getReadableHashRateString, shorten} from './utils';
import $ from "jquery";
import moment from 'moment/moment';
import parseUrl from 'url-parse';

let lastPayload = {};

export function getLastPayload() {
    return lastPayload;
}

export function fetchServers() {
    const $tbody = $('#serverTable').find('tbody').html(`
        <tr>
            <td colspan="11">
                <div class="made-with lead">
                    made with
                    <i title="... love ..." class="fa fa-fw fa-heart fa-spin"></i>
                    somewhere in
                    <span title="... Switzerland" class="made-with-flag">&nbsp;<i style="color: white;" class="fa fa-plus fa-fw"></i>&nbsp;</span>
                </div>
            </td>
        </tr>
    `);
    return fetch('./api/servers')
        .then(resp => resp.json())
        .then(payload => {
            localStorage.setItem('lastPayload', JSON.stringify(payload));
            const {servers = [], updatedOn} = payload;
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
                    const loc = server.location || 'unknown';
                    const locCell = shorten(loc);
                    const locTooltip = loc !== locCell ? loc : null;
                    const tpl = `
                <tr>
                <td class="text-center"><i class="fa fa-fw fa-check"></i></td>
                <td data-toggle="tooltip" data-html="true" title="${secTl}" class="${secCls}"><a target="_blank" href="${server.front}">${server.name}</a></td>
                <td data-toggle="${locTooltip && 'tooltip'}" title="${locTooltip}">${ shorten(server.location) || 'unknown' }</td>
                <td class="text-right">${ floatToString(server.stats.config.fee) || 0 }%</td>
                <td class="text-right">${ getReadableCoins(server.stats, server.stats.config.minPaymentThreshold, 3, true) }</td>
                <td class="text-right">${ getReadableHashRateString(server.stats.pool.hashrate) }</td>
                <td class="text-right">${ server.stats.pool.totalBlocks || '0' }</td>
                <td class="text-right">${ moment(parseInt(server.stats.pool.lastBlockFound)).fromNow() }</td>
                <td class="text-right">${ server.stats.pool.miners }</td>
                <td class="text-right">${ server.stats.pool.totalMinersPaid }</td>
                <td class="text-right">${ server.stats.pool.totalPayments }</td>
                </tr>
                `;
                    $tbody.append(tpl);
                }
            });
            $('#serverTable').find('tbody').find('[data-toggle="tooltip"]').tooltip();
        })
        .catch(err => console.error(err));
}

$('a[name="refreshServers"]').click(evt => {
    evt.preventDefault();
    fetchServers();
});
