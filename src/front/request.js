import GitHub from 'github-api';
import $ from 'jquery';

$(() => {

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
        const token = $('meta[property="x:github:accessToken"]').attr('content');
        $requestStep2Dialog.find('a[name="github-logout"]').attr('href', `auth/github/logout?accessToken=${token}`);

        const username = $('meta[property="x:github:username"]').attr('content');
        $requestStep2Dialog.find('.github-username').text(username);

        $forms.attr('hidden', 'hidden');
        $forms.find('input, textarea, button').removeAttr('disabled');
        $forms.find('button i').removeClass('fa-spin');
        $forms[0].reset();
    });

    $forms.on('submit', evt => {
        evt.preventDefault();

        const token = $('meta[property="x:github:accessToken"]').attr('content');
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
            body: body.join('\n')
        };

        $forms.find('input, textarea, button').attr('disabled', '');
        $forms.find('button i').addClass('fa-spin');

        new GitHub({token}).getIssues(repoUser, repoName).createIssue(issueData)
            .then(result => {
                $requestStep3Dialog.addClass('success').removeClass('failure');
                return result.data && result.data.html_url;
            })
            .catch(err => {
                console.error(err);
                $requestStep3Dialog.removeClass('success').addClass('failure');
            })
            .then(url => {
                $('#github-issue-link').attr('href', url);
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
        $('meta[property="x:github:accessToken"]').attr('content', context.accessToken);
        $('meta[property="x:github:username"]').attr('content', context.username);
        $requestStep2Dialog.modal('show');
    }

    const loginFailure = hash.indexOf('#login-failure') > -1;
    if (loginFailure) {
        $(window).one('hashchange', evt => evt.preventDefault());
        location.hash = '';
    }

});
