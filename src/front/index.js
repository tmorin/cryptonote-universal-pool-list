import 'bootstrap';
import 'babel-polyfill';
import 'whatwg-fetch';
import $ from 'jquery';
import './index.less';
import {fetchServers} from './servers';
import {restoreAddress} from "./address";
import GitHub from 'github-api';

$('body').css({'display': 'block'});
$('[data-toggle="tooltip"]').tooltip();

function refreshAll() {
    return fetchServers()
        .then(restoreAddress)
        .catch(console.error)
        .then(() => setTimeout(refreshAll, 1000 * 60 * 5));
}

$(() => {
    refreshAll();

    const $requestDialog = $('#requestDialog');
    const $requestForm = $requestDialog.find('form[name=submitRequest]');

    const $requestResultDialog = $('#requestResultDialog');

    $requestDialog.on('show.bs.modal', () => {
        $requestForm.find('input, textarea, button').removeAttr('disabled');
        $requestForm.find('button i').removeClass('fa-spin');
        $requestForm[0].reset();
    });

    $requestForm.on('submit', evt => {
        evt.preventDefault();

        const token = evt.target.accessToken.value;
        const repoUser = evt.target.repoUser.value;
        const repoName = evt.target.repoName.value;
        const host = location.hostname;
        const action = evt.target.action.value;
        const name = evt.target.name.value;
        const front = evt.target.front.value;
        const back = evt.target.back.value;
        const locations = evt.target.locations.value;
        const comments = evt.target.comments.valu;

        const issueData = {
            title: `[${host}] - ${action} ${name}`,
            body: `action: ${action}
name: ${name}
front: ${front || ''}
back: ${back || ''}
locations: ${locations || ''}
comments:
${comments || ''}
            `,
            labels: ['servers']
        };

        $requestForm.find('input, textarea, button').attr('disabled', '');
        $requestForm.find('button i').addClass('fa-spin');

        new GitHub({token}).getIssues(repoUser, repoName).createIssue(issueData)
            .then(() => {
                $requestResultDialog.addClass('success').removeClass('failure');
            })
            .catch(err => {
                console.error(err);
                $requestResultDialog.removeClass('success').addClass('failure');
            })
            .then(() => {
                $requestDialog
                    .one('hidden.bs.modal', () => $requestResultDialog.modal('show'))
                    .modal('hide');
            });

    });

    const hash = decodeURI(window.location.hash);
    const loginSuccess = hash.indexOf('#login-success') > -1;
    if (loginSuccess) {
        const context = JSON.parse(hash.replace('#login-success=', ''));
        $requestForm.find('[name=accessToken]').val(context.accessToken);
        $requestDialog.modal('show');
    }

    const loginFailure = hash.indexOf('#login-failure') > -1;
    if (loginFailure) {

    }

    $(window).one('hashchange', (evt) => evt.preventDefault());
    location.hash = '';
});

