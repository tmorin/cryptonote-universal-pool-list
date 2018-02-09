import express from 'express';
import request from 'request';
import {CALLBACK_URL, CURRENCY, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, HOME_URL} from './config';
import {fetchServers} from './servers';
import {checkAddress} from './address';
import passport from 'passport';
import {Strategy as GitHubStrategy} from 'passport-github2';

const app = express();

if (GITHUB_CLIENT_ID) {
    passport.use(new GitHubStrategy({
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: CALLBACK_URL
        },
        (accessToken, refreshToken, {username}, done) => {
            done(null, {accessToken, username});
        }
    ));
}

passport.serializeUser((user, done) => done(null, user));

app.use(passport.initialize());

app.use(express.static('public', {
    index: `${CURRENCY}.html`
}));

request.defaults({
    strictSSL: false
});

app.get('/auth/github',
    passport.authenticate('github', {
        scope: ['public_repo'],
        session: false,
        failureRedirect: `${HOME_URL}#login-error`
    }));

app.get('/auth/github/callback',
    passport.authenticate('github', {
        scope: ['public_repo'],
        session: false,
        failureRedirect: `${HOME_URL}#login-failure`
    }),
    (req, res) => res.redirect(`${HOME_URL}#login-success=${JSON.stringify(req.user)}`));

app.get('/api/servers', (req, res) => {
    fetchServers()
        .then(payload => res.send(payload))
        .catch(error => {
            console.error(error);
            res.status(500).end();
        });
});

app.get('/api/address/:address', (req, res) => {
    checkAddress(req.params.address)
        .then(payload => res.send(payload))
        .catch(error => {
            console.error(error);
            res.status(500).end();
        });
});

app.listen(8888, () => {
    console.log('App listening on port 8888!');
});
