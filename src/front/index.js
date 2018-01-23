import 'bootstrap';
import 'babel-polyfill';
import 'whatwg-fetch';
import $ from 'jquery';
import './index.less';
import {fetchServers} from './servers';
import {restoreAddress} from './address';
import './request';

$('body').css({'display': 'block'});
$('[data-toggle="tooltip"]').tooltip();
$('#navbar').on('click', '.nav-link', evt => {
    $(evt.delegateTarget).find('[data-toggle="collapse"]:not(.collapsed)').click()
});

function refreshAll() {
    return fetchServers()
        .then(restoreAddress)
        .catch(console.error)
        .then(() => setTimeout(refreshAll, 1000 * 60 * 5));
}

$(() => {
    refreshAll();
});
