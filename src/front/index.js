import 'bootstrap';
import 'babel-polyfill';
import 'whatwg-fetch';
import $ from 'jquery';
import GitHub from 'github-api';
import './index.less';
import {fetchServers} from './servers';
import {restoreAddress} from "./address";

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

    const $requestStep2Dialog = $('#requestStep2Dialog');
    const $formSelection = $requestStep2Dialog.find('.form-selection');
    const $forms = $requestStep2Dialog.find('form');
    const $requestStep3Dialog = $('#requestStep3Dialog');

    $formSelection.on('change', 'input', evt => {
        const formSelector = `form[name="${evt.target.value}Server"]`;
        $forms.attr('hidden', 'hidden');
        $requestStep2Dialog.find(formSelector).removeAttr('hidden');
    });

    $requestStep2Dialog.on('show.bs.modal', () => {
        $forms.attr('hidden', 'hidden');
        $forms.find('input, textarea, button').removeAttr('disabled');
        $forms.find('button i').removeClass('fa-spin');
        $forms[0].reset();
    });

    $forms.on('submit', evt => {
        evt.preventDefault();

        const token = $('meta[property="x:app:accessToken"]').attr('content');
        const repoUser = $('meta[property="x:app:repoUser"]').attr('content');
        const repoName = $('meta[property="x:app:repoName"]').attr('content');
        const host = location.hostname;
        const action = evt.target.action.value;
        const name = evt.target.name.value;
        const comments = evt.target.comments.value;

        const body = [];

        if (action !== 'remove') {
            const front = evt.target.front.value;
            const back = evt.target.back.value;
            const locations = evt.target.locations.value;
            const file = {name, front, back, location: locations};
            body.push('```');
            body.push(JSON.stringify(file, null, 2));
            body.push('```');
        }

        if (comments) {
            body.push('comments:');
            body.push(comments);
        }

        const issueData = {
            title: `[${host}] - ${action} - ${name}`,
            body: body.join('\n'),
            labels: ['servers']
        };

        $forms.find('input, textarea, button').attr('disabled', '');
        $forms.find('button i').addClass('fa-spin');

        new GitHub({token}).getIssues(repoUser, repoName).createIssue(issueData)
            .then(() => {
                $requestStep3Dialog.addClass('success').removeClass('failure');
            })
            .catch(err => {
                console.error(err);
                $requestStep3Dialog.removeClass('success').addClass('failure');
            })
            .then(() => {
                $requestStep2Dialog
                    .one('hidden.bs.modal', () => $requestStep3Dialog.modal('show'))
                    .modal('hide');
            });
    });

    const hash = decodeURI(window.location.hash);
    const loginSuccess = hash.indexOf('#login-success') > -1;
    if (loginSuccess) {
        $(window).one('hashchange', evt => evt.preventDefault());
        location.hash = '';
        const context = JSON.parse(hash.replace('#login-success=', ''));
        $('meta[property="x:app:accessToken"]').attr('content', context.accessToken);
        $requestStep2Dialog.modal('show');
    }

    const loginFailure = hash.indexOf('#login-failure') > -1;
    if (loginFailure) {
        $(window).one('hashchange', evt => evt.preventDefault());
        location.hash = '';
    }
});

