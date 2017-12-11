import $ from 'jquery';
import moment from 'moment/moment';
import {getReadableCoins, getReadableNumber} from './utils';

function backupAddress() {
    const address = $('form[name="checkForm"] [name=address]').val();
    if (address) {
        localStorage.setItem('address', address);
    }
    return address;
}

export function restoreAddress() {
    const address = localStorage.getItem('address');
    if (address) {
        $('form[name=checkForm] [name=address]').val(address);
        checkAddress();
    } else {
        $('form[name=checkForm]')[0].reset();
        $('#addressTable').find('tbody').append(`
            <tr><td colspan="5" class="text-center">Noting to display, please enter an address ...</td></tr>
        `);
    }
}

function checkAddress() {
    const address = backupAddress();

    const $btn = $('form[name=checkForm] button[type=submit]').attr('disabled', '');
    const $btnTxt = $btn.find('.text').text('Loading ...');
    const $btnFa = $btn.find('.fa').addClass('fa-spin');

    const $table = $('#addressTable').addClass('loading');
    const $tbody = $table.find('tbody');

    return fetch(`./api/address/${address}`)
        .then(resp => resp.json())
        .then(servers => {
            $tbody.html('');
            servers.forEach(server => {
                const tpl = `
                    <tr>
                        <td>${server.name}</td>
                        <td class="text-right">${server.address.stats.hashrate ? server.address.stats.hashrate + '/s' : '0 H/s'}</td>
                        <td class="text-right">${getReadableNumber(parseFloat(server.address.stats.hashes))}</td>
                        <td class="text-right">${moment.unix(parseFloat(server.address.stats.lastShare)).fromNow()}</td>
                        <td class="text-right">${getReadableCoins(server.stats, server.address.stats.balance, 5, true)}</td>
                        <td class="text-right">${getReadableCoins(server.stats, server.address.stats.paid, 5, true)}</td>
                    </tr>`;
                $tbody.append(tpl);
            });
        })
        .catch(err => {
            console.error(err);
            $tbody.html(
                `<tr><td colspan="6" class="table-danger text-center">Unable to fetch address's stats.</td></tr>`
            );
        })
        .then(() => {
            $btn.removeAttr('disabled');
            $btnTxt.text('Check');
            $btnFa.removeClass('fa-spin');
            $table.removeClass('loading');
        });
}

$('form[name="checkForm"]').submit(evt => {
    evt.preventDefault();
    checkAddress();
});
